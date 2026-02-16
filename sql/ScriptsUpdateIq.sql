-- Add IqScore to Students
ALTER TABLE public.students 
ADD COLUMN iq_score integer;

-- Add ImageUrl to IqOption
ALTER TABLE public.iq_options 
ADD COLUMN image_url text;

-- Create IqTestGroup table for Group Activation
CREATE TABLE public.iq_test_groups (
    id bigserial PRIMARY KEY,
    test_id bigint NOT NULL,
    group_id integer NOT NULL,
    is_active boolean DEFAULT true,
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT fk_iq_test_groups_test FOREIGN KEY (test_id) REFERENCES public.iq_tests(id) ON DELETE CASCADE,
    CONSTRAINT fk_iq_test_groups_group FOREIGN KEY (group_id) REFERENCES public.school_groups(id) ON DELETE CASCADE
);

-- Index for faster lookups
CREATE INDEX idx_iq_test_groups_group_id ON public.iq_test_groups(group_id);
CREATE INDEX idx_iq_test_groups_test_id ON public.iq_test_groups(test_id);
