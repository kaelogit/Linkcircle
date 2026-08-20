-- Complimentary picnic seats for remaining LC admins (count toward the 30).
-- Safe to re-run. Skips phones that already have a paid picnic registration.
-- Abdulkareem already paid publicly — not inserted.
-- Kiel Tee may already exist from 015.

do $$
declare
  v_event_id text := 'evt_networking_picnic_0829';
  r record;
  v_participant_id text;
  v_reg_id text;
  v_ref text;
  v_phone_key text;
  v_slug text;
begin
  for r in
    select * from (values
      ('Chukwuebuka Elvis', '08112759009', 'elvis@linkcircle.ng', 'elvis'),
      ('Mohammed Aalliyah Kaaka', '08112849937', 'aalliyah@linkcircle.ng', 'aalliyah'),
      ('Fehintade Habibat Omolara', '08108359209', 'omolara@linkcircle.ng', 'omolara'),
      ('Aremu Barakat Ejide', '09077397922', 'aremu@linkcircle.ng', 'aremu'),
      ('Kiel Tee', '09133263052', 'kiel.tee@linkcircle.ng', 'kiel')
    ) as t(full_name, phone, email, slug)
  loop
    v_phone_key := right(regexp_replace(r.phone, '\D', '', 'g'), 10);
    v_slug := r.slug;

    if exists (
      select 1
      from public.event_registrations er
      where er.event_id = v_event_id
        and er.status = 'paid'
        and right(regexp_replace(er.phone, '\D', '', 'g'), 10) = v_phone_key
    ) then
      continue;
    end if;

    v_participant_id := 'p_comp_' || v_slug || '_' || substr(md5(random()::text), 1, 10);
    v_reg_id := 'reg_comp_' || v_slug || '_' || substr(md5(random()::text), 1, 10);
    v_ref := 'lc_picnic_comp_' || v_slug || '_' || substr(md5(random()::text), 1, 8);

    insert into public.participants (
      id, event_id, full_name, phone, whatsapp, payment_status, pass_token
    ) values (
      v_participant_id,
      v_event_id,
      r.full_name,
      r.phone,
      r.phone,
      'complimentary',
      'pass_' || substr(md5(random()::text || clock_timestamp()::text || v_slug), 1, 40)
    );

    insert into public.event_registrations (
      id, event_id, full_name, email, phone, residence, whatsapp,
      bring_item, amount_kobo, currency, status, paystack_reference, participant_id
    ) values (
      v_reg_id,
      v_event_id,
      r.full_name,
      r.email,
      r.phone,
      'Link Circle admin',
      r.phone,
      'Admin / hosting support',
      0,
      'NGN',
      'paid',
      v_ref,
      v_participant_id
    );
  end loop;
end $$;
