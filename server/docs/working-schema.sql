--
-- PostgreSQL database dump
--

-- Dumped from database version 16.4 (Debian 16.4-1.pgdg120+2)
-- Dumped by pg_dump version 16.3 (Postgres.app)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: citext; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;


--
-- Name: EXTENSION citext; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION citext IS 'data type for case-insensitive character strings';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: prevent_archived_channel_updates(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.prevent_archived_channel_updates() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF OLD.archived_at IS NOT NULL THEN
    RAISE EXCEPTION 'Cannot modify archived channel';
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.prevent_archived_channel_updates() OWNER TO postgres;

--
-- Name: sync_auth0_user(character varying, character varying, character varying, character varying, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sync_auth0_user(p_auth0_id character varying, p_email character varying, p_username character varying, p_full_name character varying, p_avatar_url text) RETURNS character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_user_id VARCHAR;
BEGIN
    -- Try to find existing user
    SELECT id INTO v_user_id FROM users WHERE auth0_id = p_auth0_id;
    
    IF v_user_id IS NULL THEN
        -- Create new user if not found
        v_user_id := generate_ulid();
        INSERT INTO users (
            id,
            auth0_id,
            email,
            username,
            full_name,
            avatar_url
        ) VALUES (
            v_user_id,
            p_auth0_id,
            p_email,
            p_username,
            p_full_name,
            p_avatar_url
        );
    ELSE
        -- Update existing user
        UPDATE users SET
            email = p_email,
            username = p_username,
            full_name = p_full_name,
            avatar_url = p_avatar_url,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = v_user_id;
    END IF;
    
    RETURN v_user_id;
END;
$$;


ALTER FUNCTION public.sync_auth0_user(p_auth0_id character varying, p_email character varying, p_username character varying, p_full_name character varying, p_avatar_url text) OWNER TO postgres;

--
-- Name: sync_auth0_user(character varying, character varying, character varying, character varying, character varying, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.sync_auth0_user(p_user_id character varying, p_auth0_id character varying, p_email character varying, p_username character varying, p_full_name character varying, p_avatar_url text) RETURNS character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_user_id VARCHAR;
BEGIN
    -- Try to find existing user
    SELECT id INTO v_user_id FROM users WHERE auth0_id = p_auth0_id;
    
    IF v_user_id IS NULL THEN
        -- Create new user if not found
        INSERT INTO users (
            id,
            auth0_id,
            email,
            username,
            full_name,
            avatar_url
        ) VALUES (
            p_user_id,
            p_auth0_id,
            p_email,
            p_username,
            p_full_name,
            p_avatar_url
        );
        v_user_id := p_user_id;
    ELSE
        -- Update existing user
        UPDATE users SET
            email = p_email,
            username = p_username,
            full_name = p_full_name,
            avatar_url = p_avatar_url,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = v_user_id;
    END IF;
    
    RETURN v_user_id;
END;
$$;


ALTER FUNCTION public.sync_auth0_user(p_user_id character varying, p_auth0_id character varying, p_email character varying, p_username character varying, p_full_name character varying, p_avatar_url text) OWNER TO postgres;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: channel_members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.channel_members (
    id character varying(26) NOT NULL,
    channel_id character varying(26) NOT NULL,
    user_id character varying(26) NOT NULL,
    role character varying(20) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT channel_members_role_check CHECK (((role)::text = ANY ((ARRAY['owner'::character varying, 'admin'::character varying, 'member'::character varying])::text[])))
);


ALTER TABLE public.channel_members OWNER TO postgres;

--
-- Name: channels; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.channels (
    id character varying(26) NOT NULL,
    name character varying(80) NOT NULL,
    description text,
    type character varying(20) NOT NULL,
    created_by character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone,
    archived_at timestamp with time zone,
    archived_by character varying(50),
    CONSTRAINT channels_type_check CHECK (((type)::text = ANY ((ARRAY['public'::character varying, 'private'::character varying, 'dm'::character varying])::text[])))
);


ALTER TABLE public.channels OWNER TO postgres;

--
-- Name: files; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.files (
    id character varying(26) NOT NULL,
    message_id character varying(26) NOT NULL,
    user_id character varying(26) NOT NULL,
    name character varying(255) NOT NULL,
    type character varying(100) NOT NULL,
    size bigint NOT NULL,
    url text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.files OWNER TO postgres;

--
-- Name: message_reads; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.message_reads (
    id character varying(26) NOT NULL,
    user_id character varying(26) NOT NULL,
    channel_id character varying(26) NOT NULL,
    last_read_message_id character varying(26) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.message_reads OWNER TO postgres;

--
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    id character varying(26) NOT NULL,
    channel_id character varying(26) NOT NULL,
    user_id character varying(26) NOT NULL,
    content text NOT NULL,
    thread_id character varying(26),
    edited boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.messages OWNER TO postgres;

--
-- Name: migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    executed_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.migrations OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.migrations_id_seq OWNER TO postgres;

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: sync_state; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sync_state (
    id character varying(26) NOT NULL,
    user_id character varying(26) NOT NULL,
    channel_id character varying(26) NOT NULL,
    last_synced_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    sync_type character varying(20) NOT NULL,
    sync_status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    error_details jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT sync_state_sync_status_check CHECK (((sync_status)::text = ANY ((ARRAY['pending'::character varying, 'complete'::character varying, 'error'::character varying])::text[]))),
    CONSTRAINT sync_state_sync_type_check CHECK (((sync_type)::text = ANY ((ARRAY['messages'::character varying, 'files'::character varying, 'reactions'::character varying])::text[])))
);


ALTER TABLE public.sync_state OWNER TO postgres;

--
-- Name: user_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_settings (
    id character varying(26) NOT NULL,
    user_id character varying(26) NOT NULL,
    theme character varying(20) DEFAULT 'light'::character varying NOT NULL,
    notifications jsonb DEFAULT '{}'::jsonb NOT NULL,
    muted_channels character varying(26)[] DEFAULT NULL::character varying[],
    offline_sync jsonb DEFAULT '{"file_sync_days": 7, "message_sync_days": 7}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT user_settings_theme_check CHECK (((theme)::text = ANY ((ARRAY['light'::character varying, 'dark'::character varying])::text[])))
);


ALTER TABLE public.user_settings OWNER TO postgres;

--
-- Name: user_status; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_status (
    id character varying(26) NOT NULL,
    user_id character varying(26) NOT NULL,
    presence character varying(20) DEFAULT 'offline'::character varying NOT NULL,
    status_text character varying(100),
    status_emoji character varying(32),
    status_expiry timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT user_status_presence_check CHECK (((presence)::text = ANY ((ARRAY['online'::character varying, 'away'::character varying, 'offline'::character varying])::text[])))
);


ALTER TABLE public.user_status OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id character varying(26) NOT NULL,
    auth0_id character varying(128) NOT NULL,
    email character varying(255) NOT NULL,
    username character varying(50) NOT NULL,
    full_name character varying(100) NOT NULL,
    avatar_url text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: channel_members channel_members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.channel_members
    ADD CONSTRAINT channel_members_pkey PRIMARY KEY (id);


--
-- Name: channels channels_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.channels
    ADD CONSTRAINT channels_pkey PRIMARY KEY (id);


--
-- Name: files files_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_pkey PRIMARY KEY (id);


--
-- Name: message_reads message_reads_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.message_reads
    ADD CONSTRAINT message_reads_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: sync_state sync_state_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sync_state
    ADD CONSTRAINT sync_state_pkey PRIMARY KEY (id);


--
-- Name: user_settings user_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_settings
    ADD CONSTRAINT user_settings_pkey PRIMARY KEY (id);


--
-- Name: user_status user_status_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_status
    ADD CONSTRAINT user_status_pkey PRIMARY KEY (id);


--
-- Name: users users_auth0_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_auth0_id_key UNIQUE (auth0_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_channel_members_channel_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_channel_members_channel_id ON public.channel_members USING btree (channel_id);


--
-- Name: idx_channel_members_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_channel_members_role ON public.channel_members USING btree (role);


--
-- Name: idx_channel_members_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_channel_members_user_id ON public.channel_members USING btree (user_id);


--
-- Name: idx_channels_archived_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_channels_archived_at ON public.channels USING btree (archived_at) WHERE (archived_at IS NULL);


--
-- Name: idx_channels_created_by; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_channels_created_by ON public.channels USING btree (created_by);


--
-- Name: idx_channels_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_channels_name ON public.channels USING btree (name);


--
-- Name: idx_channels_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_channels_type ON public.channels USING btree (type);


--
-- Name: idx_files_message_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_files_message_id ON public.files USING btree (message_id);


--
-- Name: idx_files_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_files_type ON public.files USING btree (type);


--
-- Name: idx_files_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_files_user_id ON public.files USING btree (user_id);


--
-- Name: idx_message_reads_channel_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_message_reads_channel_id ON public.message_reads USING btree (channel_id);


--
-- Name: idx_message_reads_last_read_message_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_message_reads_last_read_message_id ON public.message_reads USING btree (last_read_message_id);


--
-- Name: idx_message_reads_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_message_reads_user_id ON public.message_reads USING btree (user_id);


--
-- Name: idx_messages_channel_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_channel_id ON public.messages USING btree (channel_id);


--
-- Name: idx_messages_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_created_at ON public.messages USING btree (created_at);


--
-- Name: idx_messages_thread_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_thread_id ON public.messages USING btree (thread_id);


--
-- Name: idx_messages_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_user_id ON public.messages USING btree (user_id);


--
-- Name: idx_sync_state_channel_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sync_state_channel_id ON public.sync_state USING btree (channel_id);


--
-- Name: idx_sync_state_last_synced_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sync_state_last_synced_at ON public.sync_state USING btree (last_synced_at);


--
-- Name: idx_sync_state_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sync_state_user_id ON public.sync_state USING btree (user_id);


--
-- Name: idx_user_settings_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_settings_user_id ON public.user_settings USING btree (user_id);


--
-- Name: idx_user_status_presence; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_status_presence ON public.user_status USING btree (presence);


--
-- Name: idx_user_status_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_user_status_user_id ON public.user_status USING btree (user_id);


--
-- Name: idx_users_auth0_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_auth0_id ON public.users USING btree (auth0_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_username; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_username ON public.users USING btree (username);


--
-- Name: channels prevent_archived_channel_updates; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER prevent_archived_channel_updates BEFORE UPDATE ON public.channels FOR EACH ROW EXECUTE FUNCTION public.prevent_archived_channel_updates();


--
-- Name: channel_members update_channel_members_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_channel_members_updated_at BEFORE UPDATE ON public.channel_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: channels update_channels_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_channels_updated_at BEFORE UPDATE ON public.channels FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: files update_files_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_files_updated_at BEFORE UPDATE ON public.files FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: message_reads update_message_reads_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_message_reads_updated_at BEFORE UPDATE ON public.message_reads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: messages update_messages_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON public.messages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: sync_state update_sync_state_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_sync_state_updated_at BEFORE UPDATE ON public.sync_state FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: user_settings update_user_settings_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: user_status update_user_status_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_user_status_updated_at BEFORE UPDATE ON public.user_status FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: channel_members channel_members_channel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.channel_members
    ADD CONSTRAINT channel_members_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.channels(id) ON DELETE CASCADE;


--
-- Name: channel_members channel_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.channel_members
    ADD CONSTRAINT channel_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: channels channels_archived_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.channels
    ADD CONSTRAINT channels_archived_by_fkey FOREIGN KEY (archived_by) REFERENCES public.users(id);


--
-- Name: channels channels_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.channels
    ADD CONSTRAINT channels_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: files files_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.messages(id) ON DELETE CASCADE;


--
-- Name: files files_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: message_reads message_reads_channel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.message_reads
    ADD CONSTRAINT message_reads_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.channels(id) ON DELETE CASCADE;


--
-- Name: message_reads message_reads_last_read_message_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.message_reads
    ADD CONSTRAINT message_reads_last_read_message_id_fkey FOREIGN KEY (last_read_message_id) REFERENCES public.messages(id) ON DELETE CASCADE;


--
-- Name: message_reads message_reads_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.message_reads
    ADD CONSTRAINT message_reads_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: messages messages_channel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.channels(id) ON DELETE CASCADE;


--
-- Name: messages messages_thread_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_thread_id_fkey FOREIGN KEY (thread_id) REFERENCES public.messages(id) ON DELETE CASCADE;


--
-- Name: messages messages_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: sync_state sync_state_channel_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sync_state
    ADD CONSTRAINT sync_state_channel_id_fkey FOREIGN KEY (channel_id) REFERENCES public.channels(id) ON DELETE CASCADE;


--
-- Name: sync_state sync_state_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sync_state
    ADD CONSTRAINT sync_state_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_settings user_settings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_settings
    ADD CONSTRAINT user_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_status user_status_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_status
    ADD CONSTRAINT user_status_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

