export const SLUG = {
  Baptism: 'baptism',
  Wedding: 'wedding',
  'Funeral Service': 'funeral',
  Confirmation: 'confirmation',
  'First Communion': 'communion',
  Blessing: 'blessing',
  'Marriage Preparation': 'marriageprep'
};
export const TAGLINE = {
  Baptism: 'A new life in Christ',
  Wedding: 'A union in faith and love',
  'Funeral Service': "In God's loving care",
  Confirmation: 'Strengthen your faith',
  'First Communion': 'Receiving Christ with joy',
  Blessing: 'Prayer and blessing for your family',
  'Marriage Preparation': 'Preparing couples for married life'
};
export const slug = (s) => SLUG[s] || 'baptism';
export const kind = (s) => (s === 'Baptism' ? 'baptism' : s === 'Wedding' ? 'wedding' : s === 'Funeral Service' ? 'funeral' : 'other');
export const fmtDate = (d) => (d ? new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No date');
export const fmtTime = (t) => {
  if (!t || !/^\d{1,2}:\d{2}/.test(t)) return t || '';
  const [h, m] = t.split(':');
  const hh = Number(h);
  return `${hh % 12 || 12}:${m.slice(0, 2)} ${hh >= 12 ? 'PM' : 'AM'}`;
};
