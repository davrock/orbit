[English](README.md) | [Deutsch](README.de.md) | [Français](README.fr.md) | [Italiano](README.it.md) | [Español](README.es.md) | [Polski](README.pl.md) | [Português](README.pt.md) | [한국어](README.ko.md) | [中文](README.zh.md) | [日本語](README.ja.md) | [हिन्दी](README.hi.md)

# 🛸 ORBIT - Orchestrated Robotic Build & Integration Toolkit

स्व-सुधार, स्मार्ट मॉडल चयन, और सर्वोत्तम प्रथाओं के प्रवर्तन के साथ AI-संचालित स्वायत्त सॉफ़्टवेयर विकास।

> "ह्यूस्टन, हमने उड़ान भरी!" 🚀

**अब TypeScript द्वारा संचालित — बेहतर विश्वसनीयता और टाइप सुरक्षा के लिए!**

📚 **[इंटरैक्टिव डॉक्यूमेंटेशन](docs/index.html)** - ब्राउज़र प्लेग्राउंड में ORBIT कमांड आज़माएँ!

## त्वरित शुरुआत

### इंस्टॉल करें

```bash
# विकल्प 1: npm (कोई भी प्लेटफ़ॉर्म)
npm install -g @davrock/orbit

# विकल्प 2: सोर्स से (Unix/macOS)
git clone https://github.com/davrock/orbit.git && cd orbit && ./install.sh

# विकल्प 3: सोर्स से (Windows PowerShell)
git clone https://github.com/davrock/orbit.git; cd orbit; .\install.ps1
```

### उपयोग करें

```bash
# पूर्ण फ़ीचर वर्कफ़्लो
orbit launch "add user authentication"

# बग फ़िक्स (सस्ते मॉडल का उपयोग करता है)
orbit repair "fix login crash"

# स्व-सुधार लूप (पहले कतार प्रोसेस करता है)
orbit evolve

# पता लगाई गई कॉन्फ़िगरेशन जाँचें
orbit config
```

## 🚀 मिशन (वर्कफ़्लो)

| मिशन | चरण | उपयोग |
|-------|------|-------|
| `launch` | योजना → कार्यान्वयन → परीक्षण → समीक्षा → कमिट | नई सुविधाएँ |
| `repair` | डिबग → कार्यान्वयन → परीक्षण → कमिट | बग फ़िक्स |
| `warp` | कार्यान्वयन → कमिट | त्वरित परिवर्तन |
| `mayday` | डिबग → कार्यान्वयन → कमिट | हॉटफ़िक्स |
| `preflight` | परीक्षण → कार्यान्वयन → परीक्षण → समीक्षा → कमिट | TDD वर्कफ़्लो |
| `shields-up` | योजना → कार्यान्वयन → सुरक्षा → परीक्षण → समीक्षा → कमिट | सुरक्षा-संवेदनशील |
| `dock` | योजना → कार्यान्वयन → परीक्षण → दस्तावेज़ → कमिट | API विकास |
| `transmit` | कार्यान्वयन → समीक्षा → कमिट | दस्तावेज़ीकरण |
| `apollo` | सभी चरण | व्यापक |
| `ralph` | कार्यान्वयन → परीक्षण → समीक्षा → कमिट | **स्थायी मोड** (कभी हार नहीं मानता) |
| `plan` | साक्षात्कार → आवश्यकताएँ | **आवश्यकता एकत्रीकरण** (योजना साक्षात्कार) |
| `ultrawork` | योजना → कार्यान्वयन → समीक्षा → कमिट | **समानांतर निष्पादन** (स्वतंत्र उप-कार्य) |
| `swarm` | योजना → कार्यान्वयन → समीक्षा → कमिट | **समन्वित समानांतर** (निर्भरताओं के साथ) |
| `pipeline` | योजना → कार्यान्वयन → परीक्षण → समीक्षा → कमिट | **अनुक्रमिक चरण** (चरणों के बीच हैंडऑफ़) |

```bash
orbit missions  # सभी सूचीबद्ध करें
```

### 🎤 प्लान मोड - इंटरैक्टिव आवश्यकता एकत्रीकरण

`plan` कमांड निष्पादन से पहले विस्तृत आवश्यकताएँ एकत्र करने के लिए एक इंटरैक्टिव योजना साक्षात्कार आयोजित करता है:

```bash
# स्वतंत्र आवश्यकता एकत्रीकरण
orbit plan "add shopping cart feature"

# किसी भी मिशन के साथ --plan फ़्लैग द्वारा
orbit launch --plan "add user authentication"
orbit warp --plan "refactor database layer"
```

**कैसे काम करता है:**
- **AI-जनित प्रश्न**: आपके कार्य के आधार पर 5-7 स्पष्टीकरण प्रश्न उत्पन्न करता है
- **इंटरैक्टिव साक्षात्कार**: Copilot CLI इंटरैक्शन के माध्यम से प्रश्न पूछता है
- **स्मार्ट संश्लेषण**: उत्तरों से विस्तृत आवश्यकता विनिर्देश बनाता है
- **स्वचालित एकीकरण**: निष्पादन के दौरान आवश्यकताएँ क्रू सदस्यों तक पहुँचती हैं
- **विनिर्देश सहेजता है**: `.copilot/state/plan_requirements.json` में एकत्रित आवश्यकताएँ संग्रहीत करता है

### 🔄 राल्फ़ मोड - अडिग दृढ़ता

`ralph` मिशन एक विशेष दृढ़ता मोड है जो कार्य सत्यापित होने तक हार नहीं मानता:

```bash
orbit ralph "implement complex feature"
orbit ralph --max-attempts 15 "difficult refactor"
```

**कैसे काम करता है:**
- **स्वचालित पुनर्प्रयास**: विफल चरणों को 10 बार तक पुनर्प्रयास करता है (कॉन्फ़िगर करने योग्य)
- **स्मार्ट उन्नयन**: 2 प्रयासों के बाद मॉडल टियर बढ़ाता है (fast → standard → premium)
- **क्रू रोटेशन**: नए दृष्टिकोण के लिए 4 प्रयासों के बाद क्रू सदस्य बदलता है
- **दृष्टिकोण विविधता**: हर 3 प्रयासों में अलग कार्यान्वयन रणनीतियाँ आज़माता है
- **सत्यापन**: आगे बढ़ने से पहले प्रत्येक चरण के पूर्ण होने की पुष्टि करता है

### ⚡ समानांतर निष्पादन मोड

#### 🚀 अल्ट्रावर्क मोड - स्वतंत्र समानांतर कार्य

```bash
orbit ultrawork "refactor codebase with multiple independent modules"
orbit ultrawork --concurrency 6 "optimize performance across components"
```

#### 🐝 स्वॉर्म मोड - समन्वित समानांतर निष्पादन

```bash
orbit swarm "implement user authentication system"
orbit swarm --concurrency 4 "build API with database and tests"
```

#### 🔀 पाइपलाइन मोड - अनुक्रमिक बहु-चरण प्रोसेसिंग

```bash
orbit pipeline "implement data processing system"
orbit pipeline --premium "complex refactoring with multiple stages"
```

**अल्ट्रावर्क बनाम स्वॉर्म बनाम पाइपलाइन:**
- **अल्ट्रावर्क**: शुद्ध समानांतर, सभी कार्य स्वतंत्र
- **स्वॉर्म**: निर्भरताओं के साथ समानांतर तरंगें, समन्वित निष्पादन
- **पाइपलाइन**: अनुक्रमिक हैंडऑफ़, चरण एक-दूसरे पर निर्माण करते हैं

## 🧠 स्मार्ट मॉडल चयन

कार्य के अनुसार इष्टतम LLM मॉडल का स्वचालित चयन:

| टियर | आइकन | लागत | उपयोग |
|------|-------|------|-------|
| `premium` | 🔥 | 3x | आर्किटेक्चर, सुरक्षा, जटिल डिबगिंग |
| `standard` | ⚡ | 1x | सामान्य विकास, परीक्षण, समीक्षा |
| `fast` | 💨 | 0.5x | दस्तावेज़, फ़ॉर्मेटिंग, सरल फ़िक्स |
| `ecomode` | 🌱 | 0.6x | **बजट-सचेत** (30-50% बचत) |

```bash
orbit launch --premium "security audit"   # प्रीमियम बाध्य करें
orbit transmit --economy "update README"  # फ़ास्ट बाध्य करें
orbit launch --ecomode "add feature"      # बजट-सचेत मोड
orbit fuel                                # टोकन उपयोग देखें
```

## 🤖 AI प्रदाता एकीकरण

एकाधिक AI प्रदाताओं का उपयोग करके वैकल्पिक क्रॉस-सत्यापन:

```bash
# बाहरी प्रदाता सेट करें (वैकल्पिक)
export GEMINI_API_KEY="your-key"
export OPENAI_API_KEY="your-key"
export ANTHROPIC_API_KEY="your-key"

# प्रदाताओं में क्रॉस-सत्यापन सक्षम करें
orbit launch "implement payment API" --cross-validate
```

## 📚 सर्वोत्तम प्रथाएँ

सभी क्रू सदस्य मानकों के लिए `.copilot/best-practices.yaml` का संदर्भ लेते हैं:
- कोडिंग मानक (TypeScript, Python, JavaScript)
- परीक्षण पैटर्न (arrange-act-assert, नामकरण)
- सुरक्षा दिशानिर्देश (OWASP, इनपुट सत्यापन)
- दस्तावेज़ीकरण परंपराएँ
- Git कमिट मानक

## 🧑‍🚀 क्रू (एजेंट)

| क्रू | भूमिका | मॉडल |
|------|--------|-------|
| `commander` | सिस्टम आर्किटेक्ट | 🔥 प्रीमियम |
| `pilot` | कार्यान्वयनकर्ता | ⚡ स्टैंडर्ड |
| `engineer` | बग जासूस | 🔥 प्रीमियम |
| `navigator` | कोड समीक्षक | ⚡ स्टैंडर्ड |
| `specialist` | QA विशेषज्ञ | ⚡ स्टैंडर्ड |
| `security-officer` | सुरक्षा विशेषज्ञ | 🔥 प्रीमियम |
| `propulsion` | प्रदर्शन | ⚡ स्टैंडर्ड |
| `comms` | दस्तावेज़ीकरण | 💨 फ़ास्ट |
| `ground-control` | DevOps | ⚡ स्टैंडर्ड |
| `mission-planner` | योजनाकार | ⚡ स्टैंडर्ड |
| `hal` | स्व-सुधार | ⚡ स्टैंडर्ड |

```bash
orbit crews
orbit launch --crew security-officer "add auth"
```

## 🧬 स्व-सुधार लूप

प्राथमिकता क्रम: **कतार → GitHub Issues → स्व-सुधार**

```bash
orbit evolve              # बंद होने तक चलाएँ
orbit evolve --once       # एकल चक्र
orbit evolve --turbo      # तीव्र मोड (30 सेकंड विलंब)
orbit evolve --max 50     # चक्र सीमित करें
orbit status              # इतिहास दिखाएँ
orbit reset               # फ़ेलसेफ़ काउंटर रीसेट करें
```

### कार्गो मैनिफ़ेस्ट (कार्य कतार)

```bash
# कार्य जोड़ें
orbit cargo-add "Add user authentication" --priority high
orbit cargo-add "Add dark mode toggle"

# कतार देखें
orbit cargo

# सभी प्रोसेस करें
orbit cargo-run
```

### ग्राउंड कंट्रोल फ़ेलसेफ़ 🚨

अनंत लूप रोकता है:
- ✓ अधिकतम 3 लगातार विफलताएँ → कूलडाउन
- ✓ अधिकतम 5 बिना-प्रगति चक्र → मिशन रद्द
- ✓ दोहराव सुधार पहचानता है → विविधता आवश्यक
- ✓ अंतरिक्ष उद्धरण ("ह्यूस्टन, हमें एक समस्या है!")

## 📋 कार्यान्वयन योजना

विस्तृत योजनाएँ और GitHub issues उत्पन्न करें:

```bash
# किसी सुविधा के लिए उड़ान योजना बनाएँ
orbit flight-plan new "Add OAuth2 authentication"

# गहरा विश्लेषण
orbit flight-plan new "Refactor database layer" --depth 3

# सभी योजनाएँ सूचीबद्ध करें
orbit flight-plan list

# एक विशिष्ट योजना देखें
orbit flight-plan show plan-001

# योजना को GitHub पर प्रकाशित करें
orbit flight-plan publish plan-001 --mode epic
```

### योजना गहराई स्तर

| गहराई | विवरण |
|-------|-------|
| 1 | त्वरित: 3-5 उच्च-स्तरीय कार्य |
| 2 | मानक: 8-12 कार्य निर्णयों के साथ (डिफ़ॉल्ट) |
| 3 | विस्तृत: 15+ कार्य, आर्किटेक्चर, जोखिम, परीक्षण |

## फ़ाइलें

```
orbit/
├── src/                 # TypeScript स्रोत
│   ├── cli/             # CLI कमांड
│   ├── core/            # टाइप्स, डिटेक्शन, स्टेट
│   ├── workflows/       # मिशन कंट्रोल, लॉन्च सीक्वेंस, आदि
│   └── utils/           # आउटपुट, git, exec यूटिलिटीज़
├── dist/                # संकलित JavaScript
├── src/config/
│   ├── crew.yaml        # क्रू परिभाषाएँ
│   ├── missions.yaml    # मिशन परिभाषाएँ
│   ├── best-practices.yaml # मानक संदर्भ
│   ├── models.yaml      # मॉडल चयन कॉन्फ़िग
│   ├── cargo_manifest.txt # कार्य कतार
│   ├── plans/           # उत्पन्न उड़ान योजनाएँ
│   └── state/           # रनटाइम स्टेट
├── package.json
├── tsconfig.json
├── QUICKSTART.md
└── README.md
```

## विकास

```bash
# विकास मोड (tsx उपयोग करता है)
npm run dev -- launch "task"

# TypeScript बिल्ड करें
npm run build

# टाइप चेक
npm run typecheck

# वैश्विक रूप से लिंक करें
npm link
```

## 💖 सहायता और योगदान

### प्रायोजन

यदि ORBIT आपका समय बचाता है और आपकी उत्पादकता बढ़ाता है, तो प्रायोजन पर विचार करें:

- ⭐ **इस रेपो को स्टार करें** - यह दूसरों को ORBIT खोजने में मदद करता है
- 💰 **GitHub Sponsors** - [@davrock को प्रायोजित करें](https://github.com/sponsors/davrock)
- ☕ **मुझे एक कॉफ़ी खरीदें** - निरंतर विकास का समर्थन करें

### योगदान करें

योगदान का स्वागत है! यहाँ तरीका है:

```bash
# फ़ोर्क और क्लोन करें
git clone https://github.com/your-username/orbit.git
cd orbit

# डिपेंडेंसीज़ इंस्टॉल करें
npm install

# अपने परिवर्तन करें
npm run dev -- launch "your improvement"

# बिल्ड और परीक्षण करें
npm run build
npm run typecheck

# PR सबमिट करें
git push origin feature/your-improvement
```

**योगदान के तरीके:**
- 🐛 बग और समस्याएँ रिपोर्ट करें
- 💡 नई सुविधाएँ या मिशन सुझाएँ
- 📚 दस्तावेज़ीकरण सुधारें
- 🧪 परीक्षण जोड़ें और कवरेज बढ़ाएँ
- 🌍 अनुवाद जोड़ें
- 🎨 UI/UX बेहतर करें

विस्तृत दिशानिर्देशों के लिए [CONTRIBUTING.md](CONTRIBUTING.md) देखें।

## लाइसेंस

MIT
