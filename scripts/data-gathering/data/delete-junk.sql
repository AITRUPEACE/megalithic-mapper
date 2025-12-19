-- Delete junk entries from database
-- Generated: 2025-12-19T21:09:13.883Z

DELETE FROM megalithic.sites WHERE slug IN (
  'arabella-station',
  'matthiae-s-cafe-and-bakery',
  'dom-zgromadzenia-majstrow-tkackich-w-odzi',
  'west-hall',
  'companhia-agricola-do-sanguinhal',
  'hoover-building'
);
