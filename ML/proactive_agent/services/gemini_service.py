"""
Gemini Service Module - Refined for Case Monitoring

This module handles Gemini generative AI operations:
- Article summarization for legal professionals
- Legal concept extraction for the "Black Box"
- RAG-based impact analysis against case documents
- Actionable alert generation
"""

import google.generativeai as genai
import os
import logging

logger = logging.getLogger(__name__)


# ============================================================================
# GEMINI GENERATIVE MODEL INITIALIZATION
# ============================================================================

def initialize_gemini_generative_model():
    """
    Initialize Gemini's generative AI model for reasoning tasks.
    
    Returns:
        genai.GenerativeModel: Configured Gemini model instance
        
    Raises:
        ValueError: If GOOGLE_API_KEY is missing
    """
    try:
        api_key = os.getenv('GEMINI_API_KEY')
        
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required")
        
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        logger.info("Gemini generative model initialized: gemini-2.0-flash")
        return model
        
    except Exception as e:
        logger.error(f"Failed to initialize Gemini generative model: {e}")
        raise


# ============================================================================
# LEGAL CONCEPT EXTRACTION (For Black Box)
# ============================================================================

def get_legal_concepts(gemini_model, text):
    """
    Extract forward-looking legal and compliance concepts from any legal document.

    Designed for company lawyers, compliance teams, and case-prep systems that
    monitor contracts, regulations, and judgments for future legal updates.

    Uses Gemini to identify 10–15 short, high-impact legal or regulatory themes
    (e.g., obligations, rights, compliance areas, doctrines, risk factors).

    Args:
        gemini_model (genai.GenerativeModel): Initialized Gemini model
        text (str): Full text of the legal document

    Returns:
        list: List of up to 15 short legal concept strings
    """
    try:
        # Limit text length to 8K chars for cost and stability
        text_sample = text[:8000] if len(text) > 8000 else text

        prompt = f"""
You are an experienced corporate lawyer and compliance strategist.

**Objective:** From the following legal document, extract the 10–15 most significant
legal or regulatory themes, obligations, or risk areas that a company or legal team
should monitor for future changes, new laws, or court rulings.

**Document Text:**
{text_sample}

**Instructions:**
- Focus on forward-looking or compliance-sensitive areas:
  - rights and obligations (e.g., disclosure duty, payment terms)
  - liabilities or defenses (e.g., indemnification, limitation of liability)
  - regulatory dependencies (e.g., data protection, employment, tax, environment)
  - legal doctrines or procedural elements (e.g., burden of proof, arbitration)
- Prefer concise 2–6 word phrases that describe *what matters legally*.
- Skip party names, boilerplate language, or generic words.
- Output only a comma-separated list (no numbering, no commentary, no quotes).
- Example output:
  data privacy compliance, arbitration clause, limitation of liability,
  disclosure obligation, employment regulation compliance,
  jurisdiction and governing law, tax reporting duty, force majeure,
  intellectual property ownership, environmental safety standards
"""

        response = gemini_model.generate_content(prompt)
        concepts_text = (response.text or "").strip()
        concepts = [c.strip() for c in concepts_text.split(",") if c.strip()]
        return concepts[:15]

    except Exception as e:
        logger.error(f"Failed to extract legal concepts: {e}")
        return []

# ============================================================================
# ARTICLE SUMMARIZATION
# ============================================================================
def summarize_articles(gemini_model, articles):
    """
    Summarize legal or regulatory articles into short actionable insights.

    Each summary highlights the legal impact, affected sectors or jurisdictions,
    and why it may matter for ongoing cases or company obligations.

    Args:
        gemini_model (genai.GenerativeModel): Initialized Gemini model
        articles (list): List of article dicts (title, snippet, link)

    Returns:
        list: Summarized legal briefings, ready for impact analysis
    """
    briefings = []

    for article in articles:
        try:
            prompt = f"""
You are an experienced legal analyst briefing corporate counsel.

**Goal:** Summarize this article in 2–3 sentences (under 100 words)
so the lawyer instantly understands the *legal or regulatory significance*
and which types of documents or obligations it may affect.

**Article Title:** {article.get('title', '')}

**Article Content:** {article.get('snippet', '')}

**Instructions:**
- Highlight *what changed* (law, ruling, regulation, or enforcement trend)
- Mention *who or what is affected* (companies, sectors, contract types)
- Use clear, factual legal language (no fluff or speculation)
- End with a short note on *potential action or relevance*
  (e.g., "may require amendment of data privacy clauses" or
   "sets precedent for employment termination disputes")
- Do not exceed 3 sentences.
- No bullet points, no introduction text.

**Your Summary:**"""

            response = gemini_model.generate_content(prompt)
            summary = (response.text or "").strip()

            briefings.append({
                "title": article.get("title", ""),
                "link": article.get("link", ""),
                "original_snippet": article.get("snippet", ""),
                "summary": summary
            })

            logger.info(f"Summarized: '{article.get('title', '')[:60]}...'")

        except Exception as e:
            logger.error(f"Failed to summarize article '{article.get('title', '')}': {e}")
            continue

    logger.info(f"Successfully summarized {len(briefings)} out of {len(articles)} articles")
    return briefings

# ============================================================================
# RAG-BASED IMPACT ANALYSIS
# ============================================================================

def generate_actionable_alert(gemini_model, briefing, pinecone_matches):
    """
    Determine if a new legal or regulatory development meaningfully affects
    any of the user's documents (contracts, policies, or cases).

    Uses RAG (Retrieval-Augmented Generation) to reason over article summaries
    and document chunks, generating a precise and conservative impact analysis.

    Args:
        gemini_model (genai.GenerativeModel): Initialized Gemini model
        briefing (dict): Article briefing with title, summary, link
        pinecone_matches (list): Top relevant document chunks from Pinecone

    Returns:
        str or None: Short legal impact statement, or None if no clear link
    """
    try:
        # Build compact but context-rich document summary for Gemini
        context_parts = []
        for i, match in enumerate(pinecone_matches):
            text_preview = match.get("text", "")[:500]
            context_parts.append(
                f"[Document {i+1} - {match.get('source', 'unknown')} | Relevance: {match.get('score', 0):.2f}]\n{text_preview}\n"
            )
        context = "\n".join(context_parts)

        prompt = f"""
You are a senior legal advisor evaluating the *practical impact* of a new legal or regulatory development
on a company's existing documents (contracts, policies, or case materials).

**New Development:**
Title: {briefing.get('title', '')}
Summary: {briefing.get('summary', '')}

**Potentially Affected Documents:**
{context}

**Your Task:**
Analyze whether this new development has any *direct and material* effect
on the obligations, clauses, or positions found in these documents.

**Instructions:**
1. Determine if the development introduces new legal duties, risks, or invalidates existing clauses.
2. If YES:
   - Write 2–3 sentences explaining *why it matters*.
   - Mention the *type of impact* (e.g., compliance update, contract revision, litigation risk).
   - Suggest *next action*: e.g., "review data retention clauses", "update employment policy", "flag for legal counsel review".
3. If there is **no clear or actionable connection**, respond with exactly:
   NO_IMPACT
4. Be conservative — flag only strong, evidence-backed connections.
5. Write in concise, professional language (no speculation, no unnecessary detail).

**Your Analysis:**"""

        response = gemini_model.generate_content(prompt)
        impact_text = (response.text or "").strip()

        # Conservative filter: discard weak or non-informative responses
        if "NO_IMPACT" in impact_text.upper() or len(impact_text) < 50:
            logger.info(f"No significant impact detected for: {briefing.get('title', '')}")
            return None

        logger.info(f"Impact analysis generated for: {briefing.get('title', '')}")
        return impact_text

    except Exception as e:
        logger.error(f"Failed to generate impact analysis for '{briefing.get('title', '')}': {e}")
        return None



# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def validate_gemini_response(response_text, min_length=20):
    """
    Validate that a Gemini response is usable.
    
    Args:
        response_text (str): The response from Gemini
        min_length (int): Minimum acceptable length
        
    Returns:
        bool: True if response is valid
    """
    if not response_text or not isinstance(response_text, str):
        return False
    
    if len(response_text.strip()) < min_length:
        return False
    
    return True