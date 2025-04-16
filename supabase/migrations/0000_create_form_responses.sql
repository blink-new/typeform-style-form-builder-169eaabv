-- Create a table to store form responses
CREATE TABLE form_responses (
    id SERIAL PRIMARY KEY,
    form_id UUID NOT NULL,
    response JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on form_id for faster lookups
CREATE INDEX idx_form_id ON form_responses (form_id);
