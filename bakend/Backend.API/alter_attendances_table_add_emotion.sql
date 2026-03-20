DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'attendances' 
        AND column_name = 'emotion'
    ) THEN
        ALTER TABLE public.attendances ADD COLUMN emotion VARCHAR(20);
    END IF;
END $$;
