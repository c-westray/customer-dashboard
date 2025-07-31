CREATE OR REPLACE TABLE `klett-cx-analytics.kwlhub_data.cleaned_logins_sept2024` AS
SELECT
  DATE(
    PARSE_TIMESTAMP(
      '%a %b %d %Y %H:%M:%S GMT%z',
      REGEXP_REPLACE(created_date, r'\s*\(.*\)$', '')
    )
  ) AS created_date,
  CAST(user_name AS STRING) AS user_name,
  CAST(user_type_id AS STRING) AS user_type_id,
  CAST(school_name AS STRING) AS school_name,
  CAST(school_id AS STRING) AS school_id,
  CAST(type AS STRING) AS type
FROM `klett-cx-analytics.kwlhub_data.logins_sept2024`
WHERE created_date IS NOT NULL;
