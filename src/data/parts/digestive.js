const P = (id, name, o) => ({ id, name, system: 'digestive', minLevel: 2, ...o });

export const DIGESTIVE_PARTS = [
  P('mouth', 'Mouth & Teeth', {
    latin: 'Cavitas oris et dentes',
    tags: ['organ'],
    details: {
      basic: 'Digestion starts in your mouth. Your teeth chew food and your saliva makes it wet and slippery.',
      middle:
        'You have 20 milk teeth as a child and 32 adult teeth. Saliva has an enzyme that starts breaking down starch.',
      high:
        'Teeth have enamel, dentine, pulp and cementum; the periodontal ligament anchors them to the alveolar bone. Three pairs of major salivary glands (parotid, submandibular, sublingual) secrete about 1–1.5 L of saliva a day.',
      undergrad:
        'Mastication is by the muscles of chewing, all supplied by CN V3. Swallowing has oral (voluntary), pharyngeal and oesophageal (involuntary) phases, coordinated by the swallowing centre in the medulla.',
      phd:
        'Research covers enamel biomineralisation and amelogenesis imperfecta genes, dental stem cells for regeneration, the oral microbiome and its links to cardiovascular and metabolic disease, and biofilms in caries and periodontitis.',
    },
  }),
  P('oesophagus', 'Food Pipe (Oesophagus)', {
    latin: 'Oesophagus',
    tags: ['organ', 'tube'],
    details: {
      basic: 'A muscular tube that squeezes food from your throat down to your stomach.',
      middle:
        'It pushes food with waves of muscle called peristalsis — that is why you can swallow upside down.',
      high:
        'About 25 cm long, passing through the diaphragm at T10. It has upper and lower oesophageal sphincters, and constrictions at the cricoid, aortic arch, left main bronchus and diaphragm.',
      undergrad:
        'The lower sphincter fails in gastro-oesophageal reflux; varices at the lower end bleed massively in portal hypertension. The lower two-thirds are smooth muscle and supplied by the vagus.',
      phd:
        'Research covers the enteric and vagal control of oesophageal peristalsis, high-resolution manometry metrics (DCI, IRP), Barrett’s oesophagus and the molecular steps to adenocarcinoma, and eosinophilic oesophagitis as an allergic disease.',
    },
  }),
  P('stomach', 'Stomach', {
    latin: 'Gaster',
    tags: ['organ'],
    details: {
      basic: 'A stretchy bag where food is mixed with strong acid and mashed into a soup.',
      middle: 'It holds about a litre when full, and acid in it kills many germs in your food.',
      high:
        'Regions: cardia, fundus, body, pylorus. The wall has three muscle layers (oblique, circular, longitudinal). Parietal cells secrete HCl and intrinsic factor; chief cells secrete pepsinogen; G cells secrete gastrin.',
      undergrad:
        'Acid secretion is driven by histamine, gastrin and acetylcholine through the H⁺/K⁺-ATPase pump (targeted by PPIs). Intrinsic factor is needed for vitamin B12 absorption in the ileum. The pylorus controls emptying.',
      phd:
        'Research covers the stem-cell organisation of gastric glands, Helicobacter pylori and the inflammation–cancer sequence, ghrelin-producing X/A-like cells, gastric slow waves and interstitial cells of Cajal in gastroparesis.',
    },
  }),
  P('small-intestine', 'Small Intestine', {
    latin: 'Intestinum tenue',
    tags: ['organ', 'tube'],
    details: {
      basic: 'A long, coiled tube where food is fully digested and its nutrients pass into your blood.',
      middle:
        'It is about 6–7 metres long, packed into your belly, with three parts: duodenum, jejunum and ileum.',
      high:
        'The mucosa is folded into plicae, villi and microvilli, multiplying the surface area roughly 600-fold to about 200 m². Crypts of Lieberkühn contain stem cells; Brunner’s glands are in the duodenum; Peyer’s patches are in the ileum.',
      undergrad:
        'Duodenum (mostly retroperitoneal) receives bile and pancreatic juice at the ampulla of Vater; jejunum absorbs most nutrients; ileum absorbs bile salts and vitamin B12. Segmentation mixes; peristalsis propels.',
      phd:
        'Research covers Lgr5⁺ crypt stem cells and organoid culture, the Paneth-cell niche, tuft cells and type 2 immunity, the gut–brain axis and enteroendocrine signalling (GLP-1, CCK, PYY), and short-bowel adaptation.',
    },
    facts: ['The small intestine is the longest part of the digestive tract, roughly 6–7 m in an adult.'],
  }),
  P('large-intestine', 'Large Intestine', {
    latin: 'Intestinum crassum',
    tags: ['organ', 'tube'],
    details: {
      basic: 'The wider tube where water is taken back from leftover food and the rest becomes poo.',
      middle:
        'It is about 1.5 m long and frames the small intestine: caecum, ascending, transverse, descending and sigmoid colon, then the rectum.',
      high:
        'It has taeniae coli, haustra and appendices epiploicae. The caecum carries the appendix; the rectum stores faeces until defecation; internal sphincter is smooth muscle, external is skeletal.',
      undergrad:
        'Water and electrolytes (and vitamin K and biotin from gut bacteria) are absorbed. Hirschsprung disease is absence of ganglion cells (failure of neural-crest migration), causing functional obstruction.',
      phd:
        'Research covers the colonic mucus bilayer, microbiome fermentation and short-chain fatty acids, the gut–immune axis in inflammatory bowel disease, the appendix as a bacterial "safe house", and colorectal cancer pathways (APC, mismatch repair, serrated).',
    },
  }),
  P('liver', 'Liver', {
    latin: 'Hepar',
    tags: ['organ', 'gland'],
    details: {
      basic: 'Your biggest internal organ. It cleans your blood and stores energy from food.',
      middle:
        'It sits under your ribs on the right side, weighs about 1.5 kg and can regrow if part is removed.',
      high:
        'Lobes (right, left, caudate, quadrate) are subdivided into segments (Couinaud, I–VIII) based on portal and hepatic venous drainage. It receives a dual supply: the hepatic artery (~25% flow) and portal vein (~75%).',
      undergrad:
        'The portal triad has a portal vein branch, hepatic artery branch and bile duct. Functions: synthesis (albumin, clotting factors), detoxification, bile production, glycogen storage, bilirubin conjugation and urea formation from ammonia.',
      phd:
        'Research covers liver zonation (periportal versus pericentral gene expression, Wnt/β-catenin gradients), hepatocyte and cholangiocyte plasticity, the hepatic stellate cell in fibrosis, non-alcoholic steatohepatitis pathogenesis, and bioartificial liver support.',
    },
    facts: ['The liver receives about 1.5 litres of blood per minute and can regenerate to full size after partial removal.'],
  }),
  P('gallbladder', 'Gallbladder', {
    latin: 'Vesica biliaris',
    tags: ['organ'],
    details: {
      basic: 'A small green bag under your liver that stores bile, a liquid that helps digest fat.',
      middle: 'After a fatty meal it squeezes bile into the small intestine through a tube.',
      high:
        'It concentrates bile about 5–10 times. The cystic duct joins the common hepatic duct to form the common bile duct, which enters the duodenum at the ampulla with the pancreatic duct (sphincter of Oddi).',
      undergrad:
        'Gallstones (cholesterol or pigment) cause biliary colic, cholecystitis, obstructive jaundice, cholangitis or pancreatitis. Calot’s triangle contains the cystic artery and is the danger zone in cholecystectomy.',
      phd:
        'Research covers cholesterol supersaturation and gallstone pathogenesis, gallbladder motility and bile acid signalling (FXR, TGR5), gallbladder cancer epidemiology, and the metabolic effects of cholecystectomy.',
    },
  }),
  P('pancreas', 'Pancreas', {
    latin: 'Pancreas',
    tags: ['organ', 'gland'],
    details: {
      basic: 'A leaf-shaped gland behind your stomach. It makes juice that digests food, and insulin that controls sugar.',
      middle:
        'It is two glands in one: the digestive part makes enzymes, and the hormone part makes insulin and glucagon.',
      high:
        'The exocrine acini secrete amylase, lipase and proteases into the duct system; the endocrine islets of Langerhans have beta (insulin), alpha (glucagon), delta (somatostatin) and PP cells.',
      undergrad:
        'Bicarbonate from duct cells neutralises stomach acid in the duodenum. Acute pancreatitis (often gallstones or alcohol) causes autodigestion and pain radiating to the back; chronic pancreatitis causes malabsorption and diabetes.',
      phd:
        'Research covers beta-cell identity and dedifferentiation, islet innervation and vasculature, stem-cell-derived islet transplantation, the tumour microenvironment of pancreatic ductal adenocarcinoma (desmoplasia, KRAS, TP53, SMAD4), and early-detection biomarkers.',
    },
  }),
  P('salivary-glands', 'Salivary Glands', {
    latin: 'Glandulae salivariae',
    minLevel: 3,
    tags: ['gland'],
    details: {
      basic: 'Glands in and near your mouth that make the watery liquid called saliva.',
      middle: 'Saliva keeps your mouth wet, starts digestion and helps you swallow.',
      high:
        'Three pairs: parotid (serous, Stensen’s duct), submandibular (mixed, Wharton’s duct) and sublingual (mostly mucous). Secretion is watery and enzyme-rich under parasympathetic control, thick and scant under sympathetic control.',
      undergrad:
        'The facial nerve passes through the parotid (its branches emerge from it, so parotid surgery risks facial nerve injury). Mumps is a viral parotitis; stones in Wharton’s duct cause meal-time swelling.',
      phd:
        'Research covers salivary gland stem cells and radiation-induced xerostomia, aquaporin-mediated fluid secretion, saliva as a diagnostic fluid, and the auriculotemporal (Frey) syndrome after parotid surgery.',
    },
  }),
  P('peritoneum', 'Peritoneum', {
    latin: 'Peritoneum',
    minLevel: 4,
    tags: ['membrane', 'tissue'],
    details: {
      basic: 'A smooth, slippery sheet that lines your belly and covers the organs inside it.',
      middle: 'It lets the organs slide past each other easily as you move and as your stomach fills.',
      high:
        'A parietal layer lines the wall; visceral layer covers organs. Mesenteries (small bowel mesentery, transverse mesocolon) suspend organs and carry vessels; the omenta (greater and lesser) hang from the stomach.',
      undergrad:
        'Intraperitoneal versus retroperitoneal determines whether pain is visceral or somatic and how fluid or infection spreads. The greater omentum is the "abdominal policeman", wrapping inflamed structures.',
      phd:
        'Research covers mesenteric continuity (the old "mesenteric organ" debate), peritoneal metastasis and the omental pre-metastatic niche, HIPEC, and mesothelial-to-mesenchymal transition in peritoneal fibrosis.',
    },
  }),
  P('gut-microbiome', 'Gut Microbiome', {
    latin: 'Microbiota intestinalis',
    minLevel: 4,
    tags: ['function', 'micro'],
    details: {
      basic: 'Trillions of tiny friendly bacteria live in your intestines and help you stay healthy.',
      middle: 'They help break down food you cannot digest, make vitamins and train your immune system.',
      high:
        'Dominated by Firmicutes, Bacteroidetes, Actinobacteria and Proteobacteria. They ferment fibre to short-chain fatty acids (butyrate, propionate, acetate) and metabolise bile acids.',
      undergrad:
        'Dysbiosis is linked to inflammatory bowel disease, obesity, allergy and even mood. Antibiotics and diet rapidly change composition; C. difficile infection follows loss of colonisation resistance.',
      phd:
        'Frontiers include causal inference from metagenome-wide association studies, defined bacterial consortia and faecal microbiota transplantation, microbe-derived metabolites signalling to the brain and immune system, and personalised nutrition glycaemic-response prediction.',
    },
  }),
];

export default DIGESTIVE_PARTS;
