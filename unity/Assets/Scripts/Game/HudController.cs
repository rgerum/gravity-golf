using GravityGolf.Core;
using UnityEngine;
using UnityEngine.Events;
using UnityEngine.UI;

namespace GravityGolf.Game
{
    /// <summary>
    /// uGUI HUD built entirely in code (spec §8), restyled to match the web game: level
    /// title + PAR chip (top-left, transparent), a translucent status card (top-center),
    /// pill buttons, a rounded level-select strip, a result banner, and a game-over modal.
    /// Chrome uses the web palette (periwinkle hairline borders, teal accent) and IBM Plex
    /// fonts. Safe-area aware via Screen.safeArea. Purely visual over the prior wiring.
    /// </summary>
    public sealed class HudController : MonoBehaviour
    {
        private GameController _controller;

        private RectTransform _safeArea;
        private Text _kicker;
        private Text _levelLabel;
        private Text _levelName;
        private Text _parPill;
        private Text _status;
        private Text _hint;
        private RectTransform _powerFill;

        private GameObject _banner;
        private Text _bannerKicker;
        private Text _bannerTitle;
        private Text _bannerDetail;
        private float _bannerTimer;

        private Pill _undoPill;
        private bool _deathMode;

        private readonly Pill[] _levelPills = new Pill[10];
        private readonly Outline[] _levelOutlines = new Outline[10];

        // ---- Web palette (src/style.css :root). ----
        private static readonly Color SurfaceFill = new Color(0.031f, 0.055f, 0.102f, 0.78f);   // rgba(8,14,26,0.78)
        private static readonly Color StatusCardFill = new Color(0.035f, 0.059f, 0.106f, 0.75f); // status-card gradient mid
        private static readonly Color ModalFill = new Color(0.035f, 0.059f, 0.106f, 0.93f);      // modal gradient mid
        private static readonly Color PrimaryFill = new Color(0.071f, 0.157f, 0.176f, 0.9f);     // dark-teal gradient mid
        private static readonly Color ChipFill = new Color(1f, 1f, 1f, 0.03f);                   // rgba(255,255,255,0.03)
        private static readonly Color TileFill = new Color(0.031f, 0.055f, 0.102f, 0.6f);

        private static readonly Color LineBorder = new Color(0.537f, 0.659f, 1f, 0.18f);   // rgba(137,168,255,0.18)
        private static readonly Color PrimaryBorder = new Color(0.49f, 0.953f, 0.851f, 0.42f); // teal

        private static readonly Color TextColor = new Color(0.929f, 0.953f, 1f, 1f);       // #edf3ff
        private static readonly Color MutedColor = new Color(0.929f, 0.953f, 1f, 0.68f);   // rgba(237,243,255,0.68)
        private static readonly Color AccentBlue = new Color(0.62f, 0.847f, 1f, 1f);       // #9ed8ff
        private static readonly Color AccentTeal = new Color(0.49f, 0.953f, 0.851f, 1f);   // #7df3d9
        private static readonly Color DangerColor = new Color(1f, 0.427f, 0.227f, 1f);     // #ff6d3a
        private static readonly Color GoldColor = ColorUtil.FromInt(0xFFC85C);
        private static readonly Color PowerFillColor = ColorUtil.FromInt(0xFF7D58);

        private static readonly Color ActiveTileFill = new Color(0.49f, 0.953f, 0.851f, 0.16f);
        private static readonly Color ActiveTileBorder = new Color(0.49f, 0.953f, 0.851f, 0.55f);
        private static readonly Color ActiveTileGlow = new Color(0.49f, 0.953f, 0.851f, 0.6f);

        public void Build(GameController controller)
        {
            _controller = controller;

            var canvasGo = new GameObject("HudCanvas", typeof(RectTransform));
            var canvas = canvasGo.AddComponent<Canvas>();
            canvas.renderMode = RenderMode.ScreenSpaceOverlay;
            canvas.sortingOrder = 100;
            var scaler = canvasGo.AddComponent<CanvasScaler>();
            scaler.uiScaleMode = CanvasScaler.ScaleMode.ScaleWithScreenSize;
            scaler.referenceResolution = new Vector2(1600, 900);
            scaler.matchWidthOrHeight = 0.5f;
            canvasGo.AddComponent<GraphicRaycaster>();

            var safeGo = new GameObject("SafeArea", typeof(RectTransform));
            safeGo.transform.SetParent(canvasGo.transform, false);
            _safeArea = (RectTransform)safeGo.transform;
            Stretch(_safeArea);

            BuildTopLeft();
            BuildStatus();
            BuildPowerBar();
            BuildBottomBar();
            BuildLevelStrip();
            BuildBanner();
        }

        // Top-left level block: no background box (like web) — a mono kicker, the hole title
        // in Plex Sans, a muted subtitle, and a small mono "PAR n" chip on the space bg.
        private void BuildTopLeft()
        {
            var block = new GameObject("LevelBlock", typeof(RectTransform));
            block.transform.SetParent(_safeArea, false);
            var rect = (RectTransform)block.transform;
            Anchor(rect, new Vector2(0f, 1f), new Vector2(0f, 1f), new Vector2(0f, 1f));
            rect.anchoredPosition = new Vector2(22f, -20f);
            rect.sizeDelta = new Vector2(440f, 150f);

            _kicker = MakeText(block.transform, "Kicker", 16, TextAnchor.UpperLeft, AccentBlue, FontLibrary.MonoSemiBold);
            Place(_kicker.rectTransform, 0f, 0f, 430f, 20f);

            _levelName = MakeText(block.transform, "LevelName", 30, TextAnchor.UpperLeft, TextColor, FontLibrary.SansSemiBold);
            Place(_levelName.rectTransform, 0f, -26f, 430f, 40f);

            _levelLabel = MakeText(block.transform, "LevelLabel", 16, TextAnchor.UpperLeft, MutedColor, FontLibrary.SansRegular);
            Place(_levelLabel.rectTransform, 1f, -68f, 430f, 22f);

            _parPill = MakeChip(block.transform, "ParPill", 1f, -98f, 96f, 30f, ChipFill, LineBorder, MutedColor, 14);
        }

        // Top-center status line, wrapped in a translucent rounded status-card. The aim hint
        // is part of the bottom control stack (portrait): it sits centered just above the
        // power bar, which sits above the Retry/Undo thumb row (see BuildBottomBar).
        private void BuildStatus()
        {
            var card = MakeCard(_safeArea, "StatusCard", StatusCardFill, LineBorder, 22f);
            Anchor(card.rectTransform, new Vector2(0.5f, 1f), new Vector2(0.5f, 1f), new Vector2(0.5f, 1f));
            card.rectTransform.anchoredPosition = new Vector2(0f, -22f);
            card.rectTransform.sizeDelta = new Vector2(440f, 46f);

            _status = MakeText(card.transform, "Status", 20, TextAnchor.MiddleCenter, TextColor, FontLibrary.SansSemiBold);
            Stretch(_status.rectTransform);

            _hint = MakeText(_safeArea, "Hint", 18, TextAnchor.MiddleCenter, MutedColor, FontLibrary.SansRegular);
            Anchor(_hint.rectTransform, new Vector2(0.5f, 0f), new Vector2(0.5f, 0f), new Vector2(0.5f, 0f));
            _hint.rectTransform.anchoredPosition = new Vector2(0f, 178f);
            _hint.rectTransform.sizeDelta = new Vector2(700f, 28f);
        }

        // Slim power meter centered in the bottom stack, above the Retry/Undo row and just
        // below the aim hint. Fill grows left-to-right via localScale (see SetPower).
        private void BuildPowerBar()
        {
            const float width = 420f;

            var back = MakePanel(_safeArea, "PowerBack", new Color(0.1f, 0.12f, 0.2f, 0.85f));
            Anchor(back.rectTransform, new Vector2(0.5f, 0f), new Vector2(0.5f, 0f), new Vector2(0.5f, 0f));
            back.rectTransform.anchoredPosition = new Vector2(0f, 150f);
            back.rectTransform.sizeDelta = new Vector2(width, 14f);

            var fill = MakePanel(back.transform, "PowerFill", PowerFillColor);
            _powerFill = fill.rectTransform;
            Anchor(_powerFill, new Vector2(0f, 0f), new Vector2(0f, 1f), new Vector2(0f, 0.5f));
            _powerFill.anchoredPosition = Vector2.zero;
            _powerFill.sizeDelta = new Vector2(width, 0f);
            _powerFill.localScale = new Vector3(0.04f, 1f, 1f);
        }

        // Bottom thumb row (portrait): Retry (full restart) pinned to the bottom-left corner
        // and Undo (rewind one shot) to the bottom-right corner, so both sit under the thumbs
        // and leave the center clear for the power bar / aim hint stacked above. Undo starts
        // disabled and is toggled by SetUndoEnabled each frame. Corner anchors keep them in
        // place at any aspect ratio.
        private void BuildBottomBar()
        {
            const float height = 92f;
            const float margin = 22f;
            const float gap = 22f;
            const float bottom = 24f;

            // Two big buttons, each filling half the width (minus a center gap) with
            // horizontal-stretch anchors so they're full-width and easy to thumb at any size.
            var retry = MakePill(_safeArea, "RetryButton", "Retry", () => _controller.RestartLevel(), SurfaceFill, LineBorder, TextColor, 22);
            retry.Rect.anchorMin = new Vector2(0f, 0f);
            retry.Rect.anchorMax = new Vector2(0.5f, 0f);
            retry.Rect.pivot = new Vector2(0.5f, 0f);
            retry.Rect.offsetMin = new Vector2(margin, bottom);
            retry.Rect.offsetMax = new Vector2(-gap * 0.5f, bottom + height);
            SetCorner(retry, height * 0.5f);

            _undoPill = MakePill(_safeArea, "UndoButton", "Undo", () => _controller.RequestRewind(), SurfaceFill, LineBorder, TextColor, 22);
            _undoPill.Rect.anchorMin = new Vector2(0.5f, 0f);
            _undoPill.Rect.anchorMax = new Vector2(1f, 0f);
            _undoPill.Rect.pivot = new Vector2(0.5f, 0f);
            _undoPill.Rect.offsetMin = new Vector2(gap * 0.5f, bottom);
            _undoPill.Rect.offsetMax = new Vector2(-margin, bottom + height);
            SetCorner(_undoPill, height * 0.5f);
            SetUndoEnabled(false);
        }

        // Level-select strip (portrait): its own full-width row above the aim hint, out of the
        // Retry/Undo thumb row so nothing collides in 1080-wide portrait. The container
        // stretches edge-to-edge (with side margins) and each of the 10 tiles is anchored to
        // the center of its 1/10 slot, so they stay evenly spread and reachable at any width.
        private void BuildLevelStrip()
        {
            const float tile = 60f;
            const float radius = 18f;
            const float sideMargin = 22f;
            const float bottom = 216f;
            const float height = 64f;

            var strip = new GameObject("LevelStrip", typeof(RectTransform));
            strip.transform.SetParent(_safeArea, false);
            var stripRect = (RectTransform)strip.transform;
            stripRect.anchorMin = new Vector2(0f, 0f);
            stripRect.anchorMax = new Vector2(1f, 0f);
            stripRect.pivot = new Vector2(0.5f, 0f);
            stripRect.offsetMin = new Vector2(sideMargin, bottom);
            stripRect.offsetMax = new Vector2(-sideMargin, bottom + height);

            for (var i = 0; i < 10; i += 1)
            {
                var index = i;
                var pill = MakePill(strip.transform, $"Level{i + 1}", (i + 1).ToString(), () => _controller.LoadLevel(index), TileFill, LineBorder, MutedColor, 18);
                var slot = (i + 0.5f) / 10f;
                Anchor(pill.Rect, new Vector2(slot, 0.5f), new Vector2(slot, 0.5f), new Vector2(0.5f, 0.5f));
                pill.Rect.anchoredPosition = Vector2.zero;
                pill.Rect.sizeDelta = new Vector2(tile, tile);
                SetCorner(pill, radius);
                _levelPills[i] = pill;

                var outline = pill.Fill.gameObject.AddComponent<Outline>();
                outline.effectColor = ActiveTileGlow;
                outline.effectDistance = new Vector2(2f, -2f);
                outline.enabled = false;
                _levelOutlines[i] = outline;
            }
        }

        // Brightens the current level's tile (teal fill + border + label + glow) and returns
        // the rest to the muted surface look so the active hole is unmistakable.
        private void HighlightLevel(int levelIndex)
        {
            for (var i = 0; i < _levelPills.Length; i += 1)
            {
                var pill = _levelPills[i];
                if (pill == null)
                {
                    continue;
                }

                var active = i == levelIndex;
                pill.Fill.color = active ? ActiveTileFill : TileFill;
                pill.Border.color = active ? ActiveTileBorder : LineBorder;
                pill.Label.color = active ? AccentTeal : MutedColor;
                if (_levelOutlines[i] != null)
                {
                    _levelOutlines[i].enabled = active;
                }
            }
        }

        private void BuildBanner()
        {
            var card = MakeCard(_safeArea, "ResultBanner", ModalFill, LineBorder, 24f);
            _banner = card.gameObject;
            Anchor(card.rectTransform, new Vector2(0.5f, 0.5f), new Vector2(0.5f, 0.5f), new Vector2(0.5f, 0.5f));
            card.rectTransform.anchoredPosition = new Vector2(0f, 120f);
            card.rectTransform.sizeDelta = new Vector2(520f, 180f);

            _bannerKicker = MakeText(card.transform, "BannerKicker", 15, TextAnchor.UpperCenter, AccentBlue, FontLibrary.MonoSemiBold);
            Place(_bannerKicker.rectTransform, 20f, -18f, 480f, 22f);

            _bannerTitle = MakeText(card.transform, "BannerTitle", 44, TextAnchor.MiddleCenter, GoldColor, FontLibrary.SansSemiBold);
            Place(_bannerTitle.rectTransform, 20f, -50f, 480f, 64f);

            _bannerDetail = MakeText(card.transform, "BannerDetail", 16, TextAnchor.LowerCenter, MutedColor, FontLibrary.MonoSemiBold);
            Place(_bannerDetail.rectTransform, 20f, -128f, 480f, 36f);

            _banner.SetActive(false);
        }


        private void Update()
        {
            var safe = Screen.safeArea;
            var width = Mathf.Max(1, Screen.width);
            var height = Mathf.Max(1, Screen.height);
            _safeArea.anchorMin = new Vector2(safe.x / width, safe.y / height);
            _safeArea.anchorMax = new Vector2((safe.x + safe.width) / width, (safe.y + safe.height) / height);
            _safeArea.offsetMin = Vector2.zero;
            _safeArea.offsetMax = Vector2.zero;

            if (_banner.activeSelf)
            {
                _bannerTimer -= Time.deltaTime;
                if (_bannerTimer <= 0f)
                {
                    _banner.SetActive(false);
                }
            }
        }

        public void OnLevelLoaded(WorldDefinition world, LevelRuntime level, int levelIndex, int par)
        {
            _kicker.text = $"WORLD {world.WorldNumber} · {world.WorldName}".ToUpperInvariant();
            _levelName.text = level.Name;
            _levelLabel.text = $"Level {levelIndex + 1} / {world.Levels.Count}";
            _parPill.text = $"PAR {par}";
            HighlightLevel(levelIndex);
        }

        public void SetStatus(string message, string hint)
        {
            _status.text = message ?? string.Empty;
            _status.color = TextColor;
            _hint.text = hint ?? string.Empty;
        }

        public void SetPower(float fraction)
        {
            var clamped = Mathf.Max(0.04f, Mathf.Min(1f, fraction));
            _powerFill.localScale = new Vector3(clamped, 1f, 1f);
        }

        public void ShowResult(WorldDefinition world, LevelRuntime level, string medalLabel, string resultName, int par, int launches)
        {
            _bannerKicker.text = $"{world.WorldName} · HOLE {level.WorldLevelNumber}".ToUpperInvariant();
            _bannerTitle.text = resultName;
            var launchWord = launches == 1 ? "launch" : "launches";
            _bannerDetail.text = $"{medalLabel} · PAR {par} · {launches} {launchWord}".ToUpperInvariant();
            _banner.SetActive(true);
            _bannerTimer = 3.4f;
        }

        // Death view: no center modal. The message shows in the top status card (danger),
        // and the recovery actions are the big bottom buttons already under the thumb —
        // Undo is promoted to the teal primary look when there's a shot to rewind.
        public void ShowGameOver(string title, string hint, bool canUndo)
        {
            _deathMode = true;
            _status.text = title ?? string.Empty;
            _status.color = DangerColor;
            _hint.text = hint ?? string.Empty;
            StyleUndo(primary: canUndo);
            ApplyPillEnabled(_undoPill, canUndo);
        }

        public void HideGameOver()
        {
            if (!_deathMode)
            {
                return;
            }

            _deathMode = false;
            _status.color = TextColor;
            StyleUndo(primary: false);
        }

        // Swaps the persistent Undo button between the muted surface look and the teal
        // primary look (used to flag it as the recommended recovery action on death).
        private void StyleUndo(bool primary)
        {
            if (_undoPill == null)
            {
                return;
            }

            _undoPill.Fill.color = primary ? PrimaryFill : SurfaceFill;
            _undoPill.Border.color = primary ? PrimaryBorder : LineBorder;
        }

        // Toggles the persistent Undo control's enabled look. Called every frame by the
        // controller with CanRewind; also dims while a rewind is playing (CanRewind is
        // false during GameState.Rewinding).
        public void SetUndoEnabled(bool enabled)
        {
            ApplyPillEnabled(_undoPill, enabled);
        }

        private static void ApplyPillEnabled(Pill pill, bool enabled)
        {
            if (pill == null)
            {
                return;
            }

            pill.Button.interactable = enabled;
            pill.Group.alpha = enabled ? 1f : 0.42f;
        }

        // ---- uGUI construction helpers ----

        private Text MakeText(Transform parent, string name, int size, TextAnchor anchor, Color color, Font font)
        {
            var go = new GameObject(name, typeof(RectTransform));
            go.transform.SetParent(parent, false);
            var text = go.AddComponent<Text>();
            text.font = font;
            text.fontSize = size;
            text.alignment = anchor;
            text.color = color;
            text.horizontalOverflow = HorizontalWrapMode.Overflow;
            text.verticalOverflow = VerticalWrapMode.Overflow;
            text.raycastTarget = false;
            return text;
        }

        // Plain-quad Image (default sprite) for the power bar and its fill.
        private Image MakePanel(Transform parent, string name, Color color)
        {
            var go = new GameObject(name, typeof(RectTransform));
            go.transform.SetParent(parent, false);
            var image = go.AddComponent<Image>();
            image.color = color;
            return image;
        }

        // A decorative rounded surface = fill Image + hairline border child. Non-interactive.
        private Image MakeCard(Transform parent, string name, Color fillColor, Color borderColor, float radius)
        {
            var go = new GameObject(name, typeof(RectTransform));
            go.transform.SetParent(parent, false);
            var fill = go.AddComponent<Image>();
            fill.sprite = RoundedSprite.Fill;
            fill.type = Image.Type.Sliced;
            fill.color = fillColor;
            fill.pixelsPerUnitMultiplier = RoundedSprite.CornerRadius / Mathf.Max(1f, radius);
            fill.raycastTarget = false;

            var border = MakeBorder(go.transform, borderColor);
            border.pixelsPerUnitMultiplier = RoundedSprite.CornerRadius / Mathf.Max(1f, radius);
            return fill;
        }

        private Image MakeBorder(Transform parent, Color color)
        {
            var go = new GameObject("Border", typeof(RectTransform));
            go.transform.SetParent(parent, false);
            var image = go.AddComponent<Image>();
            image.sprite = RoundedSprite.Border;
            image.type = Image.Type.Sliced;
            image.color = color;
            image.raycastTarget = false;
            Stretch(image.rectTransform);
            return image;
        }

        // A small rounded chip (status-pill): fill + border + centered mono label. Positioned
        // relative to the parent's top-left like Place. Returns the label for later updates.
        private Text MakeChip(Transform parent, string name, float x, float y, float width, float height, Color fillColor, Color borderColor, Color textColor, int fontSize)
        {
            var card = MakeCard(parent, name, fillColor, borderColor, height * 0.5f);
            Place(card.rectTransform, x, y, width, height);
            var label = MakeText(card.transform, "Label", fontSize, TextAnchor.MiddleCenter, textColor, FontLibrary.MonoSemiBold);
            Stretch(label.rectTransform);
            return label;
        }

        // A rounded translucent pill button: fill + hairline border + centered mono UPPERCASE
        // label, wrapped in a CanvasGroup so a disabled state dims the whole control.
        private Pill MakePill(Transform parent, string name, string label, UnityAction onClick, Color fillColor, Color borderColor, Color textColor, int fontSize)
        {
            var go = new GameObject(name, typeof(RectTransform));
            go.transform.SetParent(parent, false);
            var fill = go.AddComponent<Image>();
            fill.sprite = RoundedSprite.Fill;
            fill.type = Image.Type.Sliced;
            fill.color = fillColor;

            var group = go.AddComponent<CanvasGroup>();

            var button = go.AddComponent<Button>();
            button.transition = Selectable.Transition.None;
            button.targetGraphic = fill;
            if (onClick != null)
            {
                button.onClick.AddListener(onClick);
            }

            var border = MakeBorder(go.transform, borderColor);

            var text = MakeText(go.transform, "Label", fontSize, TextAnchor.MiddleCenter, textColor, FontLibrary.MonoSemiBold);
            Stretch(text.rectTransform);
            text.text = label.ToUpperInvariant();

            return new Pill { Button = button, Fill = fill, Border = border, Label = text, Group = group };
        }

        // Tunes a rounded element's visual corner radius (in UI units) via the sliced border
        // multiplier, so one shared sprite serves both full pills and the smaller tiles.
        private static void SetCorner(Pill pill, float radius)
        {
            var mult = RoundedSprite.CornerRadius / Mathf.Max(1f, radius);
            pill.Fill.pixelsPerUnitMultiplier = mult;
            pill.Border.pixelsPerUnitMultiplier = mult;
        }

        private static void Stretch(RectTransform rect)
        {
            rect.anchorMin = Vector2.zero;
            rect.anchorMax = Vector2.one;
            rect.offsetMin = Vector2.zero;
            rect.offsetMax = Vector2.zero;
        }

        private static void Anchor(RectTransform rect, Vector2 min, Vector2 max, Vector2 pivot)
        {
            rect.anchorMin = min;
            rect.anchorMax = max;
            rect.pivot = pivot;
        }

        // Places a child relative to the top-left of its parent.
        private static void Place(RectTransform rect, float x, float y, float width, float height)
        {
            rect.anchorMin = new Vector2(0f, 1f);
            rect.anchorMax = new Vector2(0f, 1f);
            rect.pivot = new Vector2(0f, 1f);
            rect.anchoredPosition = new Vector2(x, y);
            rect.sizeDelta = new Vector2(width, height);
        }

        // Bundles the parts of a pill button so its fill, border, label, and group can be
        // recolored (active-level highlight) or dimmed (disabled) together.
        private sealed class Pill
        {
            public Button Button;
            public Image Fill;
            public Image Border;
            public Text Label;
            public CanvasGroup Group;
            public RectTransform Rect => (RectTransform)Button.transform;
        }
    }

    /// <summary>
    /// Loads the IBM Plex TTFs from Resources/Fonts once, falling back to the built-in
    /// LegacyRuntime font (or an OS dynamic font) if a load fails so the HUD always renders.
    /// </summary>
    internal static class FontLibrary
    {
        private static Font _monoSemiBold;
        private static Font _sansSemiBold;
        private static Font _sansRegular;
        private static Font _fallback;

        public static Font MonoSemiBold => _monoSemiBold != null ? _monoSemiBold : (_monoSemiBold = Load("IBMPlexMono-SemiBold"));
        public static Font SansSemiBold => _sansSemiBold != null ? _sansSemiBold : (_sansSemiBold = Load("IBMPlexSans-SemiBold"));
        public static Font SansRegular => _sansRegular != null ? _sansRegular : (_sansRegular = Load("IBMPlexSans-Regular"));

        private static Font Fallback => _fallback != null ? _fallback : (_fallback = LoadFallback());

        private static Font Load(string fileName)
        {
            var font = Resources.Load<Font>("Fonts/" + fileName);
            return font != null ? font : Fallback;
        }

        private static Font LoadFallback()
        {
            var builtin = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            if (builtin != null)
            {
                return builtin;
            }

            return Font.CreateDynamicFontFromOSFont(new[] { "Arial", "Liberation Sans", "DejaVu Sans" }, 16);
        }
    }

    /// <summary>
    /// Generates two white 9-slice sprites once — a filled rounded-rect and a matching 1px
    /// stroke ring — anti-aliased via a signed-distance field. Both share a fixed corner
    /// region so a single sprite serves any element size; callers tint them with Image.color
    /// and tune the visual radius with Image.pixelsPerUnitMultiplier. Uses the always-present
    /// Sprites/Default (straight-alpha) shader like the rest of the project.
    /// </summary>
    internal static class RoundedSprite
    {
        public const float CornerRadius = 28f;
        private const int Radius = 28;
        private const int Mid = 4;
        private const int Size = Radius * 2 + Mid; // 60
        private const float Stroke = 2f;

        private static Sprite _fill;
        private static Sprite _border;

        public static Sprite Fill => _fill != null ? _fill : (_fill = Build(false));
        public static Sprite Border => _border != null ? _border : (_border = Build(true));

        private static Sprite Build(bool stroke)
        {
            var texture = new Texture2D(Size, Size, TextureFormat.RGBA32, false)
            {
                wrapMode = TextureWrapMode.Clamp,
                filterMode = FilterMode.Bilinear,
                hideFlags = HideFlags.HideAndDontSave
            };

            var pixels = new Color32[Size * Size];
            const float half = Size / 2f;
            for (var y = 0; y < Size; y += 1)
            {
                for (var x = 0; x < Size; x += 1)
                {
                    // Signed distance to a rounded rectangle (iq's sdRoundBox), centered.
                    var qx = Mathf.Abs(x + 0.5f - half) - (half - Radius);
                    var qy = Mathf.Abs(y + 0.5f - half) - (half - Radius);
                    var outside = Mathf.Sqrt(Mathf.Max(qx, 0f) * Mathf.Max(qx, 0f) + Mathf.Max(qy, 0f) * Mathf.Max(qy, 0f));
                    var inside = Mathf.Min(Mathf.Max(qx, qy), 0f);
                    var sdf = outside + inside - Radius;

                    float alpha;
                    if (stroke)
                    {
                        var outer = Mathf.Clamp01(0.5f - sdf);
                        var inner = Mathf.Clamp01(0.5f - (sdf + Stroke));
                        alpha = outer - inner;
                    }
                    else
                    {
                        alpha = Mathf.Clamp01(0.5f - sdf);
                    }

                    var a = (byte)Mathf.RoundToInt(Mathf.Clamp01(alpha) * 255f);
                    pixels[y * Size + x] = new Color32(255, 255, 255, a);
                }
            }

            texture.SetPixels32(pixels);
            texture.Apply();

            var border = new Vector4(Radius, Radius, Radius, Radius);
            var sprite = Sprite.Create(texture, new Rect(0f, 0f, Size, Size), new Vector2(0.5f, 0.5f), 100f, 0u, SpriteMeshType.FullRect, border);
            sprite.hideFlags = HideFlags.HideAndDontSave;
            return sprite;
        }
    }
}
