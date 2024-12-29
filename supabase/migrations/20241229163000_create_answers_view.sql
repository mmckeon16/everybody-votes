CREATE VIEW answers_with_demographics AS
SELECT
    a.id,
    a.user_id,
    a.option_id,
    a.created_at,
    d.age,
    d.gender,
    d.state,
    d.race_ethnicity,
    d.income_bracket,
    d.occupation,
    d.political_party,
    d.political_leaning,
    d.employment_status,
    d.citizenship_status
FROM answers a
LEFT JOIN demographics d ON d.user_id = a.user_id;