// Real example images for the research methods, from Wikimedia Commons (files in public/methods/).
// Each entry: method id → list of { file, caption{en,he}, author, license, licenseUrl, source }.
const B = (en, he) => ({ en, he });
const C = (file, caption, author, license, licenseUrl, title) => ({ file, caption, author, license, licenseUrl, source: `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(title.replace(/ /g, '_'))}` });
const BY_SA_3 = 'https://creativecommons.org/licenses/by-sa/3.0/', BY_SA_4 = 'https://creativecommons.org/licenses/by-sa/4.0/';

export const METHOD_IMAGES = {
  histology: [
    C('histology-cajal.png', B('Cajal\'s drawings of Golgi-stained cortex (about 1900).', 'ציורים של קחאל של קליפת מוח בצביעת גולג\'י (סביב 1900).'), 'Santiago Ramón y Cajal', 'Public domain', '', 'Cajal cortex drawings.png'),
    C('histology-nissl.png', B('Nissl stain of the human visual cortex — every cell body is coloured, so the layers show.', 'צביעת ניסל של קליפת הראייה האנושית — כל גוף תא נצבע, ולכן השכבות נראות.'), 'IkimediaWayAcklistBlayOesntDayUrkWay', 'CC0', 'https://creativecommons.org/publicdomain/zero/1.0/', 'Nissl-stained visual cortex of a human adult.png'),
    C('histology-golgi.jpg', B('A single Golgi-stained pyramidal neuron.', 'נוירון פירמידלי בודד בצביעת גולג\'י.'), 'Cahass (English Wikipedia)', 'CC BY-SA 3.0', BY_SA_3, 'GolgiStainedPyramidalCell.jpg'),
  ],
  ct: [C('ct-scans.jpg', B('(a) CT, (b) PET and (c) fMRI slices of the brain, side by side.', '(a) CT, ‏(b) PET ו-(c) fMRI — פרוסות מוח זו לצד זו.'), 'OpenStax', 'CC BY 3.0', 'https://creativecommons.org/licenses/by/3.0/', 'Scans depicting CT, PET, and fMRI brain scans.jpg')],
  mri: [C('mri-t1.jpg', B('A real T1-weighted MRI slice (horizontal plane).', 'פרוסת MRI אמיתית מסוג T1 (מישור אופקי).'), '511KeV', 'CC BY-SA 4.0', BY_SA_4, 'MRI Brain T1 Axial (5).jpg')],
  dti: [C('dti-arcuate.png', B('The arcuate fasciculus (a language pathway): dissected brain (left) and DTI tractography (right).', 'הצרור הקשתי (מסלול שפה): מוח מנותח (שמאל) וטרקטוגרפיית DTI (ימין).'), 'Fang-Cheng Yeh, Timothy D. Verstynen, Yibao Wang, Juan C. Fernández-Miranda, Wen-Yih Isaac Tseng', 'CC BY 2.5', 'https://creativecommons.org/licenses/by/2.5/', 'Arcuate fasciculus dissection and tractography.png')],
  pet: [
    C('pet-alzheimer.png', B('PET scans: a normal brain vs. a brain with Alzheimer\'s disease (less activity).', 'סריקות PET: מוח תקין מול מוח עם מחלת אלצהיימר (פחות פעילות).'), 'US National Institutes of Health (National Institute on Aging)', 'Public domain', '', 'PET scan-normal brain-alzheimers disease brain.PNG'),
    C('ct-scans.jpg', B('Compare: (a) CT, (b) PET, (c) fMRI.', 'השוואה: (a) CT, ‏(b) PET, ‏(c) fMRI.'), 'OpenStax', 'CC BY 3.0', 'https://creativecommons.org/licenses/by/3.0/', 'Scans depicting CT, PET, and fMRI brain scans.jpg'),
  ],
  fmri: [C('fmri-stroop.jpg', B('fMRI activity (orange/yellow) on MRI slices during an emotional Stroop task.', 'פעילות fMRI (כתום/צהוב) על פרוסות MRI בזמן משימת סטרופ רגשית.'), 'Shima Ovaysikia, Khalid A. Tahir, Jason L. Chan, Joseph F. X. DeSouza', 'CC BY 2.5', 'https://creativecommons.org/licenses/by/2.5/', 'FMRI BOLD activation in an emotional Stroop task.jpg')],
  eeg: [
    C('eeg-cap.jpg', B('An EEG recording cap with electrodes.', 'כובע רישום EEG עם אלקטרודות.'), 'Chris Hope', 'CC BY 2.0', 'https://creativecommons.org/licenses/by/2.0/', 'EEG Recording Cap.jpg'),
    C('eeg-stage1.jpg', B('Real EEG in stage 1 sleep: low, mixed-frequency waves.', 'EEG אמיתי בשלב 1 של השינה: גלים נמוכים בתדרים מעורבים.'), 'Unknown', 'Public domain', '', 'Sleep EEG Stage 1.jpg'),
    C('eeg-stage4.jpg', B('Real EEG in stage 4 (deep) sleep: large, slow delta waves.', 'EEG אמיתי בשלב 4 (שינה עמוקה): גלי דלתא גדולים ואיטיים.'), 'Unknown', 'Public domain', '', 'Sleep EEG Stage 4.jpg'),
  ],
  meg: [C('meg-scanner.jpg', B('An MEG scanner at the US National Institute of Mental Health.', 'סורק MEG במכון הלאומי לבריאות הנפש בארה"ב.'), 'NIMH', 'Public domain', '', 'NIMH MEG.jpg')],
  singlecell: [C('singlecell-electrode.jpg', B('A real stained neuron with a drawn-in microelectrode, showing the scale of single-cell recording.', 'נוירון צבוע אמיתי עם מיקרו-אלקטרודה מצוירת, שמראה את קנה המידה של רישום מתא בודד.'), 'Laurens R. Krol', 'CC BY-SA 4.0', BY_SA_4, 'Pyramidal hippocampal neuron with fake microelectrode.jpg')],
  tms: [C('tms-tms.jpg', B('TMS: a coil held against the head.', 'TMS: סליל המוחזק צמוד לראש.'), 'Eric Wassermann, M.D.', 'Public domain', '', 'Transcranial magnetic stimulation.jpg')],
  dbs: [
    C('dbs-setup.jpg', B('A typical DBS setup: electrode in the brain, wire under the skin, stimulator ("pacemaker") in the chest.', 'מערך DBS טיפוסי: אלקטרודה במוח, חוט מתחת לעור, ממריץ ("קוצב") בחזה.'), 'Shamir R, Noecker A, McIntyre C', 'CC BY 3.0', 'https://creativecommons.org/licenses/by/3.0/', 'Typical deep brain stimulation setup.jpg'),
    C('dbs-xray.png', B('X-ray showing implanted DBS electrodes.', 'צילום רנטגן של אלקטרודות DBS מושתלות.'), 'Jmarchn', 'CC BY-SA 3.0', BY_SA_3, 'X-ray of deep brain stimulation in OCD, L.png'),
  ],
  microdialysis: [C('microdialysis-probe.png', B('How a microdialysis probe works: fluid flows in, collects molecules through the membrane, and flows out.', 'איך בדיקת מיקרודיאליזה עובדת: נוזל זורם פנימה, אוסף מולקולות דרך הממברנה, ויוצא החוצה.'), 'StS83', 'Public domain', '', 'Schematic illustration of a microdialysis probe.png')],
  twins: [C('twins-faucher.jpg', B('Identical twin brothers (historical photograph).', 'אחים תאומים זהים (צילום היסטורי).'), 'Unknown author', 'Public domain', '', 'Faucher, frères.jpg')],
  knockout: [C('knockout-fatmouse.jpg', B('A mouse with a mutation in one gene (in the leptin system) next to a normal mouse — one missing gene changes appetite and weight. (A natural mutation, not an engineered knockout, but the same idea.)', 'עכבר עם מוטציה בגן אחד (במערכת הלפטין) לצד עכבר רגיל — גן אחד חסר משנה תיאבון ומשקל. (מוטציה טבעית, לא נוקאאוט מהונדס, אבל אותו רעיון.)'), 'Bigplankton (English Wikipedia)', 'Public domain', '', 'Fatmouse.jpg')],
  stemcells: [C('stemcells-nsc.jpg', B('Neural stem cells under a fluorescence microscope (nuclei blue).', 'תאי גזע עצביים במיקרוסקופ פלואורסצנטי (גרעינים בכחול).'), 'Wellcome Collection', 'CC BY-SA 4.0', BY_SA_4, 'Neural Stem Cells.jpg')],
};
