-- Seed coordinators from hardcoded site.ts data
-- Safe to re-run (upsert)

insert into public.coordinators (id, name, role, bio, quote, alias, is_founder, initials, accent, photo, sort_order)
values
  ('founder', 'Abdulkareem Abdulkareem', 'Founder',
   'Founder of Link Circle and StoreLink (storelink.ng). I build products and communities that help people connect, trade, and grow. Along the Ajah → Eleko corridor, I saw talent everywhere but too few spaces that felt organized, useful, and human. So I started Link Circle: a movement with clear weekly rhythm, a marketplace for real support, and hangouts that turn chats into relationships.',
   'I created Link Circle because people here deserve more than a noisy group chat. They deserve a circle where you can introduce yourself, find opportunities, push your business, make friends, and show up in real life. If StoreLink is about helping businesses grow online, Link Circle is about helping people grow together offline and online. Belong. Connect. Build.',
   null, true, 'AA', '#6b1f2a', '/team/abdulkareem-abdulkareem.png', 0),

  ('admin-ebuka', 'Chukwuebuka Elvis', 'Community Manager',
   'Passionate about building meaningful relationships, fostering engagement, and creating a thriving community. As the Community Manager of Link Circle, I am committed to ensuring every member feels welcomed, valued, and connected while driving conversations, collaboration, and opportunities that help our community grow.',
   'I believe Link Circle is more than just a community. It''s a family united by shared values, genuine connections, and a commitment to growth. It''s a place where people can network, learn, support one another, and unlock opportunities that positively impact both their personal and professional lives. Together, we are building a community where everyone has a chance to belong, contribute, and thrive.',
   'Cruiz_Kvng', false, 'EE', '#1f6f73', '/team/ebuka-elvis.png', 10),

  ('admin-aaliyah', 'Mohammed Aalliyah Kaaka', 'Legal Adviser & Chief Whip',
   'Passionate about leadership, justice, and community building. I serve as the Legal Adviser and Chief Whip of Link Circle, where I work to uphold our values, promote accountability, and foster unity among members.',
   'I believe Link Circle is more than just a community, it is a family built on unity, growth, accountability, and meaningful connections. It is a space where individuals are encouraged to learn, lead, support one another, and become the best versions of themselves.',
   null, false, 'AL', '#d4a24a', '/team/aaliyah-the-law.png', 20),

  ('admin-fehintade', 'Fehintade Habibat Omolara', 'Public Relations Officer',
   'I am committed to helping members connect, grow, and thrive. I believe every connection creates an opportunity, and together we can build a supportive community that inspires learning, success, and positive impact.',
   'To me, Link Circle is a community where people come together to connect, learn, support one another, and grow. It encourages collaboration, creates opportunities, and inspires members to become better personally, socially and professionally. I''m proud to serve as a PRO helping members feel welcomed, informed, and empowered to make the most of everything Link Circle has to offer.',
   null, false, 'FH', '#3a9a9e', '/team/fehintade-habibat.png', 30),

  ('admin-barakat', 'Aremu Barakat Ejide', 'Welfare Director',
   'As the Welfare Director, I lead with care and support for the people of this community. I act as a bridge ensuring the activities and programs are meeting the needs of the members. I also look after the physical and emotional wellbeing of members, safeguarding, organizing support during personal milestones or crises, and promoting a friendly, inclusive, and safe environment for everyone in the group.',
   'This is a community built on love and trust which enables us to be a proud family. The vision and mission of the group is a transparent one which gives room for group and individual growth, so therefore, it is "LINKED".',
   'Arbar / Hume', false, 'AB', '#e85d4c', '/team/aremu-barakat.png', 40)

on conflict (id) do update set
  name = excluded.name,
  role = excluded.role,
  bio = excluded.bio,
  quote = excluded.quote,
  alias = excluded.alias,
  is_founder = excluded.is_founder,
  initials = excluded.initials,
  accent = excluded.accent,
  photo = excluded.photo,
  sort_order = excluded.sort_order;
