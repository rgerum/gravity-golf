using GravityGolf.Core;
using UnityEngine;
using UnityEngine.Events;
using UnityEngine.UI;

namespace GravityGolf.Game
{
    /// <summary>
    /// uGUI HUD built entirely in code (spec §8): level kicker/label/name, par pill,
    /// power bar, status line, retry button, level-select strip, result banner, and a
    /// game-over modal. Safe-area aware via Screen.safeArea.
    /// </summary>
    public sealed class HudController : MonoBehaviour
    {
        private GameController _controller;
        private Font _font;

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

        private GameObject _modal;
        private Text _modalTitle;
        private Text _modalHint;

        private readonly Button[] _levelButtons = new Button[10];

        private static readonly Color PanelColor = new Color(0.03f, 0.05f, 0.10f, 0.72f);
        private static readonly Color ButtonColor = new Color(0.16f, 0.20f, 0.32f, 0.95f);
        private static readonly Color AccentColor = ColorUtil.FromInt(0xFF7D58);

        public void Build(GameController controller)
        {
            _controller = controller;
            _font = Resources.GetBuiltinResource<Font>("LegacyRuntime.ttf");
            if (_font == null)
            {
                _font = Font.CreateDynamicFontFromOSFont(new[] { "Arial", "Liberation Sans", "DejaVu Sans" }, 16);
            }

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
            BuildRetry();
            BuildLevelStrip();
            BuildBanner();
            BuildModal();
        }

        private void BuildTopLeft()
        {
            var panel = MakePanel(_safeArea, "InfoPanel", PanelColor);
            Anchor(panel.rectTransform, new Vector2(0f, 1f), new Vector2(0f, 1f), new Vector2(0f, 1f));
            panel.rectTransform.anchoredPosition = new Vector2(18f, -18f);
            panel.rectTransform.sizeDelta = new Vector2(430f, 150f);

            _kicker = MakeText(panel.transform, "Kicker", 22, TextAnchor.UpperLeft, new Color(0.75f, 0.82f, 0.95f, 1f));
            Place(_kicker.rectTransform, 16f, -12f, 400f, 26f);

            _levelLabel = MakeText(panel.transform, "LevelLabel", 20, TextAnchor.UpperLeft, new Color(0.6f, 0.68f, 0.85f, 1f));
            Place(_levelLabel.rectTransform, 16f, -40f, 400f, 24f);

            _levelName = MakeText(panel.transform, "LevelName", 34, TextAnchor.UpperLeft, Color.white);
            Place(_levelName.rectTransform, 16f, -66f, 400f, 44f);

            _parPill = MakeText(panel.transform, "ParPill", 22, TextAnchor.UpperLeft, ColorUtil.FromInt(0xFFC85C));
            Place(_parPill.rectTransform, 16f, -114f, 400f, 28f);
        }

        private void BuildStatus()
        {
            _status = MakeText(_safeArea, "Status", 26, TextAnchor.UpperCenter, Color.white);
            Anchor(_status.rectTransform, new Vector2(0.5f, 1f), new Vector2(0.5f, 1f), new Vector2(0.5f, 1f));
            _status.rectTransform.anchoredPosition = new Vector2(0f, -22f);
            _status.rectTransform.sizeDelta = new Vector2(900f, 32f);

            _hint = MakeText(_safeArea, "Hint", 20, TextAnchor.UpperCenter, new Color(0.7f, 0.78f, 0.92f, 1f));
            Anchor(_hint.rectTransform, new Vector2(0.5f, 1f), new Vector2(0.5f, 1f), new Vector2(0.5f, 1f));
            _hint.rectTransform.anchoredPosition = new Vector2(0f, -54f);
            _hint.rectTransform.sizeDelta = new Vector2(900f, 28f);
        }

        private void BuildPowerBar()
        {
            var back = MakePanel(_safeArea, "PowerBack", new Color(0.1f, 0.12f, 0.2f, 0.85f));
            Anchor(back.rectTransform, new Vector2(0.5f, 0f), new Vector2(0.5f, 0f), new Vector2(0.5f, 0f));
            back.rectTransform.anchoredPosition = new Vector2(0f, 30f);
            back.rectTransform.sizeDelta = new Vector2(360f, 18f);

            var fill = MakePanel(back.transform, "PowerFill", AccentColor);
            _powerFill = fill.rectTransform;
            Anchor(_powerFill, new Vector2(0f, 0f), new Vector2(0f, 1f), new Vector2(0f, 0.5f));
            _powerFill.anchoredPosition = Vector2.zero;
            _powerFill.sizeDelta = new Vector2(360f, 0f);
            _powerFill.localScale = new Vector3(0.04f, 1f, 1f);
        }

        private void BuildRetry()
        {
            var button = MakeButton(_safeArea, "RetryButton", "Retry", () => _controller.RestartLevel());
            Anchor(button.image.rectTransform, new Vector2(0f, 0f), new Vector2(0f, 0f), new Vector2(0f, 0f));
            button.image.rectTransform.anchoredPosition = new Vector2(18f, 22f);
            button.image.rectTransform.sizeDelta = new Vector2(120f, 46f);
        }

        private void BuildLevelStrip()
        {
            var strip = MakePanel(_safeArea, "LevelStrip", PanelColor);
            Anchor(strip.rectTransform, new Vector2(1f, 0f), new Vector2(1f, 0f), new Vector2(1f, 0f));
            strip.rectTransform.anchoredPosition = new Vector2(-18f, 22f);
            strip.rectTransform.sizeDelta = new Vector2(10 * 40f + 12f, 46f);

            for (var i = 0; i < 10; i += 1)
            {
                var index = i;
                var button = MakeButton(strip.transform, $"Level{i + 1}", (i + 1).ToString(), () => _controller.LoadLevel(index));
                Anchor(button.image.rectTransform, new Vector2(0f, 0.5f), new Vector2(0f, 0.5f), new Vector2(0f, 0.5f));
                button.image.rectTransform.anchoredPosition = new Vector2(8f + i * 40f + 18f, 0f);
                button.image.rectTransform.sizeDelta = new Vector2(36f, 36f);
                _levelButtons[i] = button;
            }
        }

        private void BuildBanner()
        {
            var panel = MakePanel(_safeArea, "ResultBanner", new Color(0.05f, 0.07f, 0.14f, 0.92f));
            _banner = panel.gameObject;
            Anchor(panel.rectTransform, new Vector2(0.5f, 0.5f), new Vector2(0.5f, 0.5f), new Vector2(0.5f, 0.5f));
            panel.rectTransform.anchoredPosition = new Vector2(0f, 120f);
            panel.rectTransform.sizeDelta = new Vector2(520f, 180f);

            _bannerKicker = MakeText(panel.transform, "BannerKicker", 22, TextAnchor.UpperCenter, new Color(0.75f, 0.82f, 0.95f, 1f));
            Place(_bannerKicker.rectTransform, 20f, -16f, 480f, 28f);

            _bannerTitle = MakeText(panel.transform, "BannerTitle", 44, TextAnchor.MiddleCenter, ColorUtil.FromInt(0xFFC85C));
            Place(_bannerTitle.rectTransform, 20f, -48f, 480f, 60f);

            _bannerDetail = MakeText(panel.transform, "BannerDetail", 24, TextAnchor.LowerCenter, Color.white);
            Place(_bannerDetail.rectTransform, 20f, -120f, 480f, 40f);

            _banner.SetActive(false);
        }

        private void BuildModal()
        {
            var panel = MakePanel(_safeArea, "GameOverModal", new Color(0.06f, 0.03f, 0.06f, 0.95f));
            _modal = panel.gameObject;
            Anchor(panel.rectTransform, new Vector2(0.5f, 0.5f), new Vector2(0.5f, 0.5f), new Vector2(0.5f, 0.5f));
            panel.rectTransform.anchoredPosition = Vector2.zero;
            panel.rectTransform.sizeDelta = new Vector2(480f, 220f);

            _modalTitle = MakeText(panel.transform, "ModalTitle", 34, TextAnchor.UpperCenter, ColorUtil.FromInt(0xFF7D58));
            Place(_modalTitle.rectTransform, 20f, -28f, 440f, 44f);

            _modalHint = MakeText(panel.transform, "ModalHint", 22, TextAnchor.UpperCenter, new Color(0.82f, 0.85f, 0.92f, 1f));
            Place(_modalHint.rectTransform, 20f, -80f, 440f, 60f);

            var retry = MakeButton(panel.transform, "ModalRetry", "Retry", () => _controller.RestartLevel());
            Anchor(retry.image.rectTransform, new Vector2(0.5f, 0f), new Vector2(0.5f, 0f), new Vector2(0.5f, 0f));
            retry.image.rectTransform.anchoredPosition = new Vector2(0f, 24f);
            retry.image.rectTransform.sizeDelta = new Vector2(160f, 50f);

            _modal.SetActive(false);
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
            _kicker.text = $"World {world.WorldNumber} · {world.WorldName}";
            _levelLabel.text = $"Level {levelIndex + 1} / {world.Levels.Count}";
            _levelName.text = level.Name;
            _parPill.text = $"Par {par}";
        }

        public void SetStatus(string message, string hint)
        {
            _status.text = message ?? string.Empty;
            _hint.text = hint ?? string.Empty;
        }

        public void SetPower(float fraction)
        {
            var clamped = Mathf.Max(0.04f, Mathf.Min(1f, fraction));
            _powerFill.localScale = new Vector3(clamped, 1f, 1f);
        }

        public void ShowResult(WorldDefinition world, LevelRuntime level, string medalLabel, string resultName, int par, int launches)
        {
            _bannerKicker.text = $"{world.WorldName} · Hole {level.WorldLevelNumber}";
            _bannerTitle.text = resultName;
            var launchWord = launches == 1 ? "launch" : "launches";
            _bannerDetail.text = $"{medalLabel} · Par {par} · {launches} {launchWord}";
            _banner.SetActive(true);
            _bannerTimer = 3.4f;
        }

        public void ShowGameOver(string title, string hint)
        {
            _modalTitle.text = title;
            _modalHint.text = hint;
            _modal.SetActive(true);
        }

        public void HideGameOver() => _modal.SetActive(false);

        // ---- uGUI construction helpers ----

        private Text MakeText(Transform parent, string name, int size, TextAnchor anchor, Color color)
        {
            var go = new GameObject(name, typeof(RectTransform));
            go.transform.SetParent(parent, false);
            var text = go.AddComponent<Text>();
            text.font = _font;
            text.fontSize = size;
            text.alignment = anchor;
            text.color = color;
            text.horizontalOverflow = HorizontalWrapMode.Overflow;
            text.verticalOverflow = VerticalWrapMode.Overflow;
            text.raycastTarget = false;
            return text;
        }

        private Image MakePanel(Transform parent, string name, Color color)
        {
            var go = new GameObject(name, typeof(RectTransform));
            go.transform.SetParent(parent, false);
            var image = go.AddComponent<Image>();
            image.color = color;
            return image;
        }

        private Button MakeButton(Transform parent, string name, string label, UnityAction onClick)
        {
            var image = MakePanel(parent, name, ButtonColor);
            var button = image.gameObject.AddComponent<Button>();
            button.targetGraphic = image;
            button.onClick.AddListener(onClick);
            var text = MakeText(image.transform, "Label", 20, TextAnchor.MiddleCenter, Color.white);
            Stretch(text.rectTransform);
            text.text = label;
            return button;
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

        // Places a child relative to the top-left of its parent panel.
        private static void Place(RectTransform rect, float x, float y, float width, float height)
        {
            rect.anchorMin = new Vector2(0f, 1f);
            rect.anchorMax = new Vector2(0f, 1f);
            rect.pivot = new Vector2(0f, 1f);
            rect.anchoredPosition = new Vector2(x, y);
            rect.sizeDelta = new Vector2(width, height);
        }
    }
}
