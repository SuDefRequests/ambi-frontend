export type Language = 'en' | 'hi' | 'mr';
export type Mode = 'visitor' | 'student' | 'researcher' | 'institution' | 'kids';
export type ExhibitId = 'writings' | 'manuscripts' | 'media' | 'timeline' | 'connections' | 'assistant';
export type Destination = { kind: 'search'; query: string } | { kind: 'exhibit'; id: ExhibitId } | { kind: 'milestone'; year: string };
export type Navigate = (destination: Destination) => void;

export const languages: { id: Language; label: string }[] = [{ id: 'en', label: 'English' }, { id: 'hi', label: 'हिन्दी' }, { id: 'mr', label: 'मराठी' }];
export const modes: Mode[] = ['visitor', 'student', 'researcher', 'institution', 'kids'];
export const exhibits: { id: ExhibitId; number: string; icon: 'book' | 'document' | 'play' | 'timeline' | 'network' | 'chat'; tone: string }[] = [
  { id: 'writings', number: '01', icon: 'book', tone: 'ochre' },
  { id: 'manuscripts', number: '02', icon: 'document', tone: 'slate' },
  { id: 'media', number: '03', icon: 'play', tone: 'maroon' },
  { id: 'timeline', number: '04', icon: 'timeline', tone: 'teal' },
  { id: 'connections', number: '05', icon: 'network', tone: 'plum' },
  { id: 'assistant', number: '06', icon: 'chat', tone: 'bronze' },
];
export const milestoneYears = ['1891', '1907', '1927', '1930', '1936', '1947', '1949', '1956'];

export const copy = {
  en: {
    archiveName: 'THE AMBEDKAR DIGITAL ARCHIVE',
    modes: {
      visitor: ['General Visitor', 'Explore & Learn'],
      student: ['Student', 'Learn & Study'],
      researcher: ['Researcher', 'Deep Dive'],
      institution: ['Institution', 'Archive & Manage'],
      kids: ['Kids Mode', 'Explore & play']
    },
    audio: 'Audio', stopAudio: 'Stop audio', accessibility: 'Accessibility', settings: 'Settings',
    eyebrow: 'IDEAS. EQUALITY. A MORE JUST INDIA.', headline: 'Explore the mind', headlineEm: 'that changed a nation.',
    description: "Discover Dr. B. R. Ambedkar’s writings, speeches, constitutional debates, manuscripts and the ideas that built modern India.",
    searchPlaceholder: 'Search writings, speeches, debates, people, places, ideas…', search: 'Search the archive',
    topics: ['Constitution', 'Representation', 'Education', 'Caste', 'Social Justice', "Women’s Rights", 'Democracy'],
    explore: 'MANY WAYS TO DISCOVER', exploreNote: 'One extraordinary legacy.',
    cards: { writings: ['Writings & Speeches', 'Explore published works, lectures and speeches.'], manuscripts: ['Manuscripts & Rare Documents', 'Discover handwritten pages and archival records.'], media: ['Audio & Video', 'Listen to speeches. Watch stories come to life.'], timeline: ['Interactive Timeline', 'Walk through a life that reshaped a nation.'], connections: ['Ideas & Connections', 'Follow the ideas. Discover how they connect.'], assistant: ['Ask the Archive', 'Explore questions through the original sources.'] },
    journey: 'A JOURNEY THROUGH TIME', journeyAction: 'Explore the timeline', milestones: ['Birth', 'Education', 'Mahad Satyagraha', 'Round Table Conferences', 'Annihilation of Caste', 'Law Minister', 'Constitution', 'Passing'],
    quote: 'Educate, agitate and organize.', quoteName: 'DR. B. R. AMBEDKAR', quoteSource: 'Address, 20 July 1942',
    footer: 'A living archive. A shared heritage.', credits: 'About & image credits', home: 'Return to the archive', close: 'Close',
    previewLabel: 'A FIRST LOOK', previewTitle: 'Your next discovery awaits.', previewDescription: 'This experience is being prepared for the archive. For now, explore the home screen and discover where your curiosity takes you.', searchPreview: 'Your search is ready', searchPreviewDescription: 'Search across the archive will open here in the next release. Your question has been kept in the search field.', modeNote: 'Mode selected. This preview shows the visitor home screen.', institutionNote: 'Institution mode is reserved for authorized archive teams. Sign-in will be available in a later release.',
    accessTitle: 'Make yourself comfortable.', accessIntro: 'Adjust this screen to suit the way you explore.', largeText: 'Larger text', largeTextHelp: 'Increase text size. The page may scroll.', contrast: 'Stronger contrast', contrastHelp: 'Darker text and clearer controls.', motion: 'Reduce motion', motionHelp: 'Keep transitions still and gentle.',
    settingsTitle: 'Your reading room.', fullscreen: 'Enter fullscreen', exitFullscreen: 'Leave fullscreen', reset: 'Reset visitor preferences', resetHelp: 'Return to English, General Visitor and default display settings.', audioUnavailable: 'Audio is unavailable in this browser. You can still read every part of the screen.', voiceUnavailable: 'A voice for this language is not installed on this device.',
    kids: ['Kids Mode', 'Explore & play'],
  },

  hi: {
    archiveName: 'आंबेडकर डिजिटल अभिलेखागार',
    modes: {
      visitor: ['सामान्य आगंतुक', 'देखें और जानें'],
      student: ['विद्यार्थी', 'पढ़ें और सीखें'],
      researcher: ['शोधकर्ता', 'गहराई से खोजें'],
      institution: ['संस्थान', 'अभिलेख प्रबंधन'],
      kids: ['बच्चों का मोड', 'देखें और सीखें']
    },
    audio: 'ऑडियो', stopAudio: 'ऑडियो रोकें', accessibility: 'सुगम्यता', settings: 'सेटिंग्स',
    eyebrow: 'विचार। समानता। एक अधिक न्यायपूर्ण भारत।', headline: 'जानिए उस चिंतन को', headlineEm: 'जिसने एक राष्ट्र को बदला।',
    description: 'डॉ. बी. आर. आंबेडकर के लेखन, भाषण, संवैधानिक बहसों, पांडुलिपियों और आधुनिक भारत को आकार देने वाले विचारों को जानें।',
    searchPlaceholder: 'लेखन, भाषण, बहसें, व्यक्ति, स्थान और विचार खोजें…', search: 'अभिलेखागार में खोजें',
    topics: ['संविधान', 'प्रतिनिधित्व', 'शिक्षा', 'जाति', 'सामाजिक न्याय', 'महिला अधिकार', 'लोकतंत्र'], explore: 'खोज के अनेक रास्ते', exploreNote: 'एक असाधारण विरासत।',
    cards: { writings: ['लेखन और भाषण', 'प्रकाशित रचनाएँ, व्याख्यान और भाषण पढ़ें।'], manuscripts: ['पांडुलिपियाँ और दुर्लभ दस्तावेज़', 'हस्तलिखित पन्ने और अभिलेख देखें।'], media: ['ऑडियो और वीडियो', 'भाषण सुनें और इतिहास की कहानियाँ देखें।'], timeline: ['संवादात्मक कालक्रम', 'राष्ट्र को बदलने वाली जीवनयात्रा जानें।'], connections: ['विचार और संबंध', 'विचारों के बीच के संबंधों को खोजें।'], assistant: ['अभिलेखागार से पूछें', 'मूल स्रोतों के माध्यम से प्रश्नों को समझें।'] },
    journey: 'समय के साथ एक यात्रा', journeyAction: 'कालक्रम देखें', milestones: ['जन्म', 'शिक्षा', 'महाड सत्याग्रह', 'गोलमेज सम्मेलन', 'जाति का विनाश', 'विधि मंत्री', 'संविधान', 'महापरिनिर्वाण'],
    quote: 'शिक्षित बनो, आंदोलन करो, संगठित हो।', quoteName: 'डॉ. बी. आर. आंबेडकर', quoteSource: 'संबोधन, 20 जुलाई 1942 · अनुवाद', footer: 'एक जीवंत अभिलेखागार। एक साझा विरासत।', credits: 'परिचय और चित्र श्रेय', home: 'अभिलेखागार पर लौटें', close: 'बंद करें',
    previewLabel: 'एक पहली झलक', previewTitle: 'आपकी अगली खोज प्रतीक्षा में है।', previewDescription: 'यह अनुभव तैयार किया जा रहा है। अभी मुख्य स्क्रीन पर अपनी रुचि के विषयों को जानें।', searchPreview: 'आपकी खोज तैयार है', searchPreviewDescription: 'अगले संस्करण में यहाँ अभिलेखागार की खोज खुलेगी। आपका प्रश्न खोज क्षेत्र में सुरक्षित है।', modeNote: 'मोड चुना गया। इस पूर्वावलोकन में आगंतुक मुख्य स्क्रीन दिखाई जाती है।', institutionNote: 'संस्थान मोड अधिकृत अभिलेख टीमों के लिए है। प्रवेश सुविधा अगले संस्करण में आएगी।',
    accessTitle: 'अपनी सुविधा के अनुसार देखें।', accessIntro: 'अपने अनुकूल स्क्रीन को समायोजित करें।', largeText: 'बड़ा पाठ', largeTextHelp: 'पाठ का आकार बढ़ाएँ। स्क्रीन स्क्रॉल हो सकती है।', contrast: 'अधिक स्पष्टता', contrastHelp: 'गहरा पाठ और अधिक स्पष्ट नियंत्रण।', motion: 'गति कम करें', motionHelp: 'एनिमेशन कम करें।', settingsTitle: 'आपका अध्ययन कक्ष।', fullscreen: 'पूर्ण स्क्रीन', exitFullscreen: 'पूर्ण स्क्रीन से बाहर', reset: 'प्राथमिकताएँ रीसेट करें', resetHelp: 'अंग्रेज़ी, सामान्य आगंतुक और मूल प्रदर्शन पर लौटें।', audioUnavailable: 'इस ब्राउज़र में ऑडियो उपलब्ध नहीं है। आप स्क्रीन पर पाठ पढ़ सकते हैं।', voiceUnavailable: 'इस उपकरण पर इस भाषा की आवाज़ स्थापित नहीं है।',
    kids: ['बच्चों का मोड', 'देखें और सीखें'],
  },

  mr: {
    archiveName: 'आंबेडकर डिजिटल अभिलेखागार',
    modes: {
      visitor: ['सामान्य अभ्यागत', 'पहा आणि जाणून घ्या'],
      student: ['विद्यार्थी', 'वाचा आणि शिका'],
      researcher: ['संशोधक', 'सखोल शोध'],
      institution: ['संस्था', 'अभिलेख व्यवस्थापन'],
      kids: ['मुलांसाठी मोड', 'पहा आणि शिका']
    },
    audio: 'ऑडिओ', stopAudio: 'ऑडिओ थांबवा', accessibility: 'सुलभता', settings: 'सेटिंग्ज',
    eyebrow: 'विचार. समता. अधिक न्याय्य भारत.', headline: 'जाणून घ्या ते विचार', headlineEm: 'ज्यांनी देश घडवला.',
    description: 'डॉ. बी. आर. आंबेडकर यांचे लेखन, भाषणे, संविधानविषयक चर्चा, हस्तलिखिते आणि आधुनिक भारत घडवणारे विचार जाणून घ्या.',
    searchPlaceholder: 'लेखन, भाषणे, चर्चा, व्यक्ती, ठिकाणे आणि विचार शोधा…', search: 'अभिलेखागारात शोधा',
    topics: ['संविधान', 'प्रतिनिधित्व', 'शिक्षण', 'जात', 'सामाजिक न्याय', 'महिलांचे हक्क', 'लोकशाही'], explore: 'शोध घेण्याचे अनेक मार्ग', exploreNote: 'एक असामान्य वारसा.',
    cards: { writings: ['लेखन आणि भाषणे', 'प्रकाशित साहित्य, व्याख्याने आणि भाषणे वाचा.'], manuscripts: ['हस्तलिखिते आणि दुर्मीळ दस्तऐवज', 'हस्तलिखित पाने आणि ऐतिहासिक नोंदी पहा.'], media: ['ऑडिओ आणि व्हिडिओ', 'भाषणे ऐका. इतिहासाच्या कथा पहा.'], timeline: ['संवादी कालपट', 'देशाला आकार देणारा जीवनप्रवास जाणून घ्या.'], connections: ['विचार आणि संबंध', 'विचारांमधील संबंधांचा शोध घ्या.'], assistant: ['अभिलेखागाराला विचारा', 'मूळ स्रोतांच्या साहाय्याने प्रश्न समजून घ्या.'] },
    journey: 'काळाच्या प्रवाहातील प्रवास', journeyAction: 'कालपट पहा', milestones: ['जन्म', 'शिक्षण', 'महाड सत्याग्रह', 'गोलमेज परिषद', 'जातिव्यवस्थेचे निर्मूलन', 'कायदा मंत्री', 'संविधान', 'महापरिनिर्वाण'],
    quote: 'शिका, संघर्ष करा, संघटित व्हा.', quoteName: 'डॉ. बी. आर. आंबेडकर', quoteSource: 'भाषण, २० जुलै १९४२ · अनुवाद', footer: 'एक जिवंत अभिलेखागार. एक सामायिक वारसा.', credits: 'परिचय आणि चित्र श्रेय', home: 'अभिलेखागाराकडे परत', close: 'बंद करा',
    previewLabel: 'पहिली झलक', previewTitle: 'तुमचा पुढचा शोध तुमची वाट पाहतो.', previewDescription: 'हा अनुभव तयार होत आहे. सध्या मुख्य स्क्रीनवर तुमच्या आवडीचे विषय जाणून घ्या.', searchPreview: 'तुमचा शोध तयार आहे', searchPreviewDescription: 'पुढील आवृत्तीत येथे अभिलेखागारातील शोध उघडेल. तुमचा प्रश्न शोध चौकटीत ठेवला आहे.', modeNote: 'मोड निवडला आहे. या पूर्वावलोकनात अभ्यागत मुख्य स्क्रीन दिसते.', institutionNote: 'संस्था मोड अधिकृत अभिलेख पथकांसाठी आहे. प्रवेश सुविधा पुढील आवृत्तीत येईल.',
    accessTitle: 'तुमच्या सोयीने पाहा.', accessIntro: 'तुमच्या आवडीनुसार स्क्रीन बदला.', largeText: 'मोठा मजकूर', largeTextHelp: 'अक्षरांचा आकार वाढवा. स्क्रीन स्क्रोल होऊ शकते.', contrast: 'अधिक स्पष्टता', contrastHelp: 'गडद मजकूर आणि स्पष्ट नियंत्रणे.', motion: 'हालचाल कमी करा', motionHelp: 'अॅनिमेशन कमी करा.', settingsTitle: 'तुमचा अभ्यासकक्ष.', fullscreen: 'पूर्ण स्क्रीन', exitFullscreen: 'पूर्ण स्क्रीनमधून बाहेर', reset: 'प्राधान्ये रीसेट करा', resetHelp: 'इंग्रजी, सामान्य अभ्यागत आणि मूळ प्रदर्शनावर परत या.', audioUnavailable: 'या ब्राउझरमध्ये ऑडिओ उपलब्ध नाही. तुम्ही मजकूर वाचू शकता.', voiceUnavailable: 'या उपकरणावर या भाषेचा आवाज स्थापित नाही.',
    kids: ['मुलांसाठी मोड', 'पहा आणि शिका'],
  }

};
export type HomeCopy = typeof copy[Language];
