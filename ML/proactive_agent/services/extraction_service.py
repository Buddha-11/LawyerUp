"""
Extraction Service Module - The "Black Box"

This module automatically extracts legal entities and concepts from case documents.
It combines NER (Named Entity Recognition) with Gemini-based concept extraction
to create a comprehensive set of search terms for monitoring.

Key Components:
- PDF text extraction using PyPDF2
- Legal NER using InLegalBERT model
- Concept extraction using Gemini
- Filtering to "public pillar" entities
"""

from transformers import AutoTokenizer, AutoModelForTokenClassification, pipeline
import PyPDF2
import io
import logging
import os

logger = logging.getLogger(__name__)

# Public pillar entity types (these will be prioritized for search)
PUBLIC_PILLAR_ENTITIES = [
    'LAW', 'ACT', 'SECTION', 'CLAUSE', 'CASE', 'COURT',
    'JUDGE', 'PROVISION', 'ORGANIZATION', 'PETITIONER', 'RESPONDENT'
]


# ============================================================================
# NER MODEL INITIALIZATION
# ============================================================================

def initialize_legal_ner_model():
    """
    Initialize the InLegalBERT Legal NER model.

    Loads a transformer model tuned for Indian legal text understanding.
    Works as a replacement for the OpenNyAI model.

    Returns:
        transformers.Pipeline: NER pipeline ready for inference
    """
    try:
        # Use local baked-in path if available (Docker/Cloud Run),
        # otherwise fall back to downloading from HuggingFace Hub.
        local_path = os.getenv("INLEGAL_BERT_PATH", "")
        if local_path and os.path.isdir(local_path):
            model_name = local_path
            logger.info(f"Loading Legal NER model from local path: {model_name}")
        else:
            model_name = "law-ai/InLegalBERT"
            logger.info(f"Loading Legal NER model from HuggingFace Hub: {model_name}")

        ner_pipeline = pipeline(
            "ner",
            model=model_name,
            tokenizer=model_name,
            grouped_entities=True
        )

        logger.info("✓ Legal NER model loaded successfully (InLegalBERT)")
        return ner_pipeline

    except Exception as e:
        logger.error(f"Failed to load Legal NER model: {e}")
        raise


# ============================================================================
# PDF TEXT EXTRACTION
# ============================================================================

def extract_text_from_pdf(pdf_file):
    """
    Extract full text from a PDF file using PyPDF2.
    Supports Flask FileStorage objects from upload endpoints.
    """
    try:
        logger.info("Extracting text from PDF...")

        pdf_bytes = pdf_file.read()
        pdf_file_obj = io.BytesIO(pdf_bytes)
        pdf_file.seek(0)

        pdf_reader = PyPDF2.PdfReader(pdf_file_obj)
        full_text = ""

        for page_num, page in enumerate(pdf_reader.pages):
            text = page.extract_text() or ""
            full_text += text + "\n"

        logger.info(f"✓ Extracted {len(full_text)} characters from {len(pdf_reader.pages)} pages")
        return full_text.strip()

    except Exception as e:
        logger.error(f"Failed to extract text from PDF: {e}")
        raise


# ============================================================================
# LEGAL ENTITY EXTRACTION
# ============================================================================

def extract_legal_entities(text, ner_pipeline):
    """
    Extract legal entities from text using the InLegalBERT NER pipeline.
    Filters and deduplicates relevant entities.
    """
    try:
        logger.info("Running Legal NER extraction...")

        text_sample = text[:15000] if len(text) > 15000 else text
        ner_results = ner_pipeline(text_sample)
        logger.info(f"NER detected {len(ner_results)} total raw entities")

        filtered_entities = []
        for entity in ner_results:
            entity_text = entity.get("word", "").strip()
            if len(entity_text) > 3:
                filtered_entities.append(entity_text)

        # Deduplicate entities (case-insensitive)
        unique_entities = list(dict.fromkeys([e for e in filtered_entities]))
        logger.info(f"✓ Filtered {len(unique_entities)} unique entities")
        return unique_entities

    except Exception as e:
        logger.error(f"Failed to extract legal entities: {e}")
        return []


# ============================================================================
# MAIN EXTRACTION PIPELINE
# ============================================================================

def run_extraction_pipeline(pdf_file, gemini_model, ner_pipeline):
    """
    Complete pipeline: PDF → Text → Entities + Gemini Concepts → Final Terms.
    """
    try:
        logger.info("=== Starting Legal Extraction Pipeline ===")

        # STEP 1: Extract text
        logger.info("[STEP 1/4] Extracting text from PDF...")
        full_text = extract_text_from_pdf(pdf_file)
        if not full_text or len(full_text) < 100:
            raise ValueError("PDF text extraction failed or document too short")
        logger.info(f"✓ Extracted text length: {len(full_text)}")

        # STEP 2: Run NER
        logger.info("[STEP 2/4] Running InLegalBERT NER...")
        ner_entities = extract_legal_entities(full_text, ner_pipeline)
        logger.info(f"✓ Extracted {len(ner_entities)} NER entities")

        # STEP 3: Extract Gemini concepts
        logger.info("[STEP 3/4] Extracting legal concepts via Gemini...")
        from .gemini_service import get_legal_concepts
        gemini_concepts = get_legal_concepts(gemini_model, full_text)
        logger.info(f"✓ Gemini returned {len(gemini_concepts)} concepts")

        # STEP 4: Combine and deduplicate
        logger.info("[STEP 4/4] Combining and deduplicating...")
        all_terms = ner_entities + gemini_concepts

        seen = set()
        final_terms = []
        for term in all_terms:
            t = term.strip().lower()
            if t not in seen and len(term) > 2:
                seen.add(t)
                final_terms.append(term)

        logger.info(f"✓ Final search terms: {len(final_terms)}")
        logger.info(f"Sample terms: {final_terms[:5]}")

        result = {
            "full_text": full_text,
            "extracted_search_terms": final_terms,
            "entity_count": len(ner_entities),
            "concept_count": len(gemini_concepts)
        }

        logger.info("=== Extraction Pipeline Complete ===")
        return result

    except Exception as e:
        logger.error(f"Extraction pipeline failed: {e}")
        raise


# ============================================================================
# RESULT VALIDATION
# ============================================================================

def validate_extraction_results(extraction_result):
    """
    Validate that the extraction output is usable and complete.
    """
    if not extraction_result:
        return False, "Extraction result is empty"
    if not extraction_result.get("full_text"):
        return False, "No text extracted from PDF"
    if len(extraction_result.get("extracted_search_terms", [])) < 3:
        return False, "Too few search terms extracted (minimum 3 required)"
    return True, None
