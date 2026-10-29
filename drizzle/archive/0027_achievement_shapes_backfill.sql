-- The silhouette follows the category: it is the second channel of the identity,
-- next to the accent, so the colour is never the only thing carrying it.
-- Re-runnable, and it leaves any category added later on the 'seal' default.
UPDATE public.achievements SET shape = CASE category
  WHEN 'Esplorazione' THEN 'seal'
  WHEN 'Padronanza'   THEN 'shield'
  WHEN 'Progresso'    THEN 'burst'
  WHEN 'Ritmo'        THEN 'hex'
  WHEN 'Metodo'       THEN 'plaque'
  WHEN 'Contributo'   THEN 'ribbon'
  WHEN 'Origine'      THEN 'diamond'
  ELSE shape
END;
