-- Complimentary picnic seats for LC admins (count toward the 30, no Paystack).
-- Safe to re-run. Skips if phone already has a paid picnic registration.
-- Founder (StoreLink) already paid publicly — not inserted here.

do $$
declare
  v_event_id text := 'evt_networking_picnic_0829';
  v_participant_id text;
  v_reg_id text;
  v_ref text;
  v_phone text := '09133263052';
  v_phone_key text := right(regexp_replace(v_phone, '\D', '', 'g'), 10);
begin
  -- Kiel Tee
  if not exists (
    select 1
    from public.event_registrations r
    where r.event_id = v_event_id
      and r.status = 'paid'
      and right(regexp_replace(r.phone, '\D', '', 'g'), 10) = v_phone_key
  ) then
    v_participant_id := 'p_comp_kiel_' || substr(md5(random()::text), 1, 12);
    v_reg_id := 'reg_comp_kiel_' || substr(md5(random()::text), 1, 12);
    v_ref := 'lc_picnic_comp_kiel_' || substr(md5(random()::text), 1, 10);

    insert into public.participants (
      id, event_id, full_name, phone, whatsapp, payment_status, pass_token
    ) values (
      v_participant_id,
      v_event_id,
      'Kiel Tee',
      v_phone,
      v_phone,
      'complimentary',
      'pass_' || substr(md5(random()::text || clock_timestamp()::text), 1, 40)
    );

    insert into public.event_registrations (
      id, event_id, full_name, email, phone, residence, whatsapp,
      bring_item, amount_kobo, currency, status, paystack_reference, participant_id
    ) values (
      v_reg_id,
      v_event_id,
      'Kiel Tee',
      'kiel.tee@linkcircle.ng',
      v_phone,
      'Link Circle admin',
      v_phone,
      'Admin / hosting support',
      0,
      'NGN',
      'paid',
      v_ref,
      v_participant_id
    );
  end if;
end $$;
