
-- Create a table to store forms
CREATE TABLE IF NOT EXISTS forms (
    id UUID PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    questions JSONB NOT NULL,
    theme JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create a function to create the forms table if it doesn't exist
CREATE OR REPLACE FUNCTION create_forms_table_if_not_exists()
RETURNS void AS $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'forms') THEN
        CREATE TABLE forms (
            id UUID PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            questions JSONB NOT NULL,
            theme JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    END IF;
END;
$$ LANGUAGE plpgsql;