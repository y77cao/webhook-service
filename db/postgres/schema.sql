-- This file contains SQL queries for defining the tables' schemas.

CREATE TABLE developers (
    id SERIAL PRIMARY KEY,
    email character varying(255) NOT NULL UNIQUE,
    name character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX developers_pkey ON developers(id int4_ops);
CREATE UNIQUE INDEX developers_email_unique ON developers(email text_ops);

CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    developer_id integer REFERENCES developers(id) ON DELETE CASCADE,
    name character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX applications_pkey ON applications(id int4_ops);
