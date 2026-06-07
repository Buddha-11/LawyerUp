# list_routes.py
import importlib
candidates = ('app','main','server','run','wsgi','api','application','proactive_agent')
for name in candidates:
    try:
        m = importlib.import_module(name)
        app = getattr(m,'app',None) or getattr(m,'application',None)
        if app:
            print(f"FOUND app in module: {name}")
            for r in app.url_map.iter_rules():
                print(f"{r.rule:40}  methods={sorted(r.methods)}")
            break
    except Exception:
        pass
else:
    print("No Flask app found in candidates. Check your entrypoint filename.")
