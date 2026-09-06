# Yaad Visual Asset Documentation

This document outlines the visual illustration asset specifications for the Yaad Mobile Application, designed specifically for elderly users, including those with limited literacy or smartphone familiarity.

## Visual Design Guidelines
- **Style**: Warm semi-realistic 2D illustrations. Friendly, dignified, and mature.
- **Form**: Clean rounded silhouettes, prominent outlines, soft and high-contrast color palettes.
- **Clarity**: High visual contrast without unnecessary decorative noise or tiny details.
- **Culture**: Appropriate Indian / North-Eastern everyday context (e.g. ceramic chai cup, Alphonso mango, road bicycle, cottage house).
- **Text**: No text embedded inside image artwork (all labels are rendered via accessible typography & multi-language localization).

---

## Asset Directory Structure

```
assets/
└── images/
    ├── home/
    │   ├── play-game.png       # Home → Play Game visual card
    │   ├── memories.png        # Home → Family Memories visual card
    │   ├── medicine.png        # Home → Daily Medicine visual card
    │   ├── water.png           # Home → Hydration / Drink Water card
    │   └── family.png          # Home / Recall → Family portrait
    ├── games/
    │   ├── apple.png           # Memory Game Card → Fresh Red Apple
    │   ├── banana.png          # Memory Game Card → Ripe Banana Bunch
    │   ├── mango.png           # Memory Game Card → Golden Alphonso Mango
    │   ├── flower.png          # Memory Game Card → Pink Lotus / Hibiscus Flower
    │   ├── cup.png             # Memory Game Card → Warm Ceramic Chai Cup
    │   ├── umbrella.png        # Memory Game Card → Sky Blue Monsoon Umbrella
    │   ├── bicycle.png         # Memory Game Card → Classic Road Bicycle
    │   ├── house.png           # Memory Game Card → Cozy Village Cottage House
    │   ├── radio.png           # Memory Game Card → Vintage Wooden Transistor Radio
    │   └── glasses.png         # Memory Game Card → Round Reading Spectacles
    ├── memory/
    │   ├── daughter-ananya.jpg # Personal Recall → Daughter Ananya
    │   ├── grandson-rohan.jpg  # Personal Recall → Grandson Rohan
    │   ├── son-vikram.jpg      # Personal Recall → Son Vikram
    │   └── diwali-family.jpg   # Personal Recall → Family Gathering
    ├── reminders/
    │   ├── morning-pill.png    # Reminder → Morning medication
    │   ├── hydration-glass.png # Reminder → Water glass
    │   └── evening-walk.png    # Reminder → Evening stroll
    └── common/
        ├── avatar-elderly.png  # User Profile → Friendly elderly avatar
        └── app-logo.png        # Branding → Yaad logo
```

---

## Detailed Asset Manifest

| Filename | Purpose & Screen | Aspect Ratio / Size | Visual Content Description |
| :--- | :--- | :--- | :--- |
| `home/play-game.png` | Patient Home → Play Game | 16:9 (600×338) | Friendly elderly person smiling while playing memory cards |
| `home/memories.png` | Patient Home → My Memories | 16:9 (600×338) | Warm family gathering with photo album |
| `home/medicine.png` | Patient Home → My Medicine | 16:9 (600×338) | Color-coded medicine organizer box, tablets, and a glass of water |
| `home/water.png` | Patient Home → Drink Water | 16:9 (600×338) | Refreshing clean water bottle and filled water tumbler |
| `home/family.png` | Patient Home / Games → Family | 16:9 (600×338) | Multi-generational loving Indian family |
| `games/apple.png` | Cognitive Memory Card | 1:1 (400×400) | Crisp red apple with green leaf on soft rose backdrop |
| `games/banana.png` | Cognitive Memory Card | 1:1 (400×400) | Golden ripe yellow bananas on soft amber backdrop |
| `games/mango.png` | Cognitive Memory Card | 1:1 (400×400) | Succulent golden Indian mango on soft peach backdrop |
| `games/flower.png` | Cognitive Memory Card | 1:1 (400×400) | Blooming pink lotus flower on blush rose backdrop |
| `games/cup.png` | Cognitive Memory Card | 1:1 (400×400) | Warm ceramic tea cup with gentle steam on amber backdrop |
| `games/umbrella.png` | Cognitive Memory Card | 1:1 (400×400) | Sky-blue canopy umbrella with raindrops on soft cyan backdrop |
| `games/bicycle.png` | Cognitive Memory Card | 1:1 (400×400) | Classic green road bicycle on soft mint backdrop |
| `games/house.png` | Cognitive Memory Card | 1:1 (400×400) | Cozy village home with terracotta roof & tree on warm sand backdrop |
| `games/radio.png` | Cognitive Memory Card | 1:1 (400×400) | Vintage wooden transistor radio on honey backdrop |
| `games/glasses.png` | Cognitive Memory Card | 1:1 (400×400) | Round reading spectacles on periwinkle backdrop |
| `memory/daughter-ananya.jpg` | Personal Memory Recall | 4:3 (800×600) | Smiling adult daughter in traditional attire |
| `memory/grandson-rohan.jpg` | Personal Memory Recall | 4:3 (800×600) | Cheerful young grandson smiling outdoors |
| `memory/son-vikram.jpg` | Personal Memory Recall | 4:3 (800×600) | Friendly adult son in comfortable home setting |
| `memory/diwali-family.jpg` | Personal Memory Recall | 16:9 (800×450) | Family celebration with warm lights and sweets |

---

## Vector & Component Fallback Engine
To ensure 100% offline reliability, instant startup, zero loading latency, and sharp scaling across all device resolutions, every visual asset is backed by an optimized React Native vector illustration system located in `components/illustrations/`.
