-- Apply once to a new Supabase project. Service credentials stay on the Next.js server.
create table public.events (
 id uuid primary key, "ownerId" uuid not null references auth.users(id),
 title text not null, "hostName" text not null, description text not null default '',
 "startsAt" timestamptz not null, "timeZone" text not null,
 location text not null, deadline timestamptz not null, "deadlineReason" text not null default '',
 "createdAt" timestamptz not null default now(), check (deadline <= "startsAt")
);
create table public.invitations (
 id uuid primary key, "eventId" uuid not null references public.events(id) on delete cascade,
 "guestName" text not null, "personalNote" text not null default '',
 "tokenHash" text not null unique, revoked boolean not null default false,
 "createdAt" timestamptz not null default now()
);
create table public.responses (
 "invitationId" uuid primary key references public.invitations(id) on delete cascade,
 status text not null check (status in ('unanswered','yes','maybe','no')),
 "followUpAt" timestamptz,
 "countingAssumption" text not null check ("countingAssumption" in ('included','not_included')),
 note text not null default '', "updatedAt" timestamptz,
 check ((status = 'yes' and "countingAssumption" = 'included') or (status <> 'yes' and "countingAssumption" = 'not_included')),
 check ((status = 'maybe' and "followUpAt" is not null) or (status <> 'maybe' and "followUpAt" is null))
);
create table public.deliveries (
 "invitationId" uuid primary key references public.invitations(id) on delete cascade,
 status text not null check (status in ('not_sent','link_copied')), "updatedAt" timestamptz
);
create index on public.events ("ownerId");
create index on public.invitations ("eventId");
alter table public.events enable row level security;
alter table public.invitations enable row level security;
alter table public.responses enable row level security;
alter table public.deliveries enable row level security;
-- Direct client access is denied. Server endpoints authenticate hosts and scope guest requests
-- to one token hash. Never expose the service-role key to the browser.
revoke all on public.events, public.invitations, public.responses, public.deliveries from anon, authenticated;
grant all on public.events, public.invitations, public.responses, public.deliveries to service_role;
