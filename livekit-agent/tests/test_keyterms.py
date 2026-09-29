from agent import build_keyterms, MAX_KEYTERM_CHARS, MAX_KEYTERMS


def test_splits_and_strips_comma_separated_skills():
    assert build_keyterms("Python, FastAPI , SQL") == ["Python", "FastAPI", "SQL"]


def test_empty_or_missing_skills_returns_empty_list():
    assert build_keyterms("") == []
    assert build_keyterms(None) == []


def test_drops_empty_entries_from_stray_commas():
    assert build_keyterms("Python,, SQL,") == ["Python", "SQL"]


def test_drops_terms_over_assemblyai_char_limit():
    too_long = "x" * (MAX_KEYTERM_CHARS + 1)
    assert build_keyterms(f"Python,{too_long}") == ["Python"]


def test_dedupes_while_preserving_order():
    assert build_keyterms("Python, SQL, Python") == ["Python", "SQL"]


def test_caps_at_assemblyai_max_keyterms():
    many_skills = ", ".join(f"skill{i}" for i in range(MAX_KEYTERMS + 10))
    result = build_keyterms(many_skills)
    assert len(result) == MAX_KEYTERMS
    assert result[0] == "skill0"
