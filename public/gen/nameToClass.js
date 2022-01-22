const NAME_TO_CLASS = {};
document.addEventListener('DOMContentLoaded', () => {
  NAME_TO_CLASS["GameBase"] = GameBase;		// lib/core/game-base.js
  NAME_TO_CLASS["Generator"] = Generator;		// lib/map/generator/base/generator.js
  NAME_TO_CLASS["SpriteMapper"] = SpriteMapper;		// lib/map/mapper/base/sprite-mapper.js
  NAME_TO_CLASS["Auxiliary"] = Auxiliary;		// lib/sprite/aux/base/auxiliary.js
  NAME_TO_CLASS["GameCore"] = GameCore;		// games/the-impossible-room/base/game-core.js
  NAME_TO_CLASS["WorldOfTurtle"] = WorldOfTurtle;		// games/turtle/base/world-of-turtle.js
  NAME_TO_CLASS["GeneratorFromConfig"] = GeneratorFromConfig;		// lib/map/generator/generator-from-config.js
  NAME_TO_CLASS["GeneratorWithCallback"] = GeneratorWithCallback;		// lib/map/generator/generator-with-callback.js
  NAME_TO_CLASS["NullGenerator"] = NullGenerator;		// lib/map/generator/null-generator.js
  NAME_TO_CLASS["ConfigMapper"] = ConfigMapper;		// lib/map/mapper/config-mapper.js
  NAME_TO_CLASS["PlatformMapper"] = PlatformMapper;		// lib/map/mapper/platform-mapper.js
  NAME_TO_CLASS["PhysicsBase"] = PhysicsBase;		// lib/physics/base/physics-base.js
  NAME_TO_CLASS["BouncerAuxiliary"] = BouncerAuxiliary;		// lib/sprite/aux/bouncer-auxiliary.js
  NAME_TO_CLASS["CollectibleAuxiliary"] = CollectibleAuxiliary;		// lib/sprite/aux/collectible-auxiliary.js
  NAME_TO_CLASS["DoorAuxiliary"] = DoorAuxiliary;		// lib/sprite/aux/door-auxiliary.js
  NAME_TO_CLASS["LandingAuxiliary"] = LandingAuxiliary;		// lib/sprite/aux/landing-auxiliary.js
  NAME_TO_CLASS["LowCeilingAuxiliary"] = LowCeilingAuxiliary;		// lib/sprite/aux/low-ceiling-auxiliary.js
  NAME_TO_CLASS["NpcAuxiliary"] = NpcAuxiliary;		// lib/sprite/aux/npc-auxiliary.js
  NAME_TO_CLASS["PlatformBlockAuxiliary"] = PlatformBlockAuxiliary;		// lib/sprite/aux/platform-block-auxiliary.js
  NAME_TO_CLASS["PlatformGridcellPositionAuxiliary"] = PlatformGridcellPositionAuxiliary;		// lib/sprite/aux/platform-gridcell-position-auxiliary.js
  NAME_TO_CLASS["Body"] = Body;		// lib/sprite/base/body.js
  NAME_TO_CLASS["Sprite"] = Sprite;		// lib/sprite/base/sprite.js
  NAME_TO_CLASS["CollisionBoxDisplay"] = CollisionBoxDisplay;		// lib/sprite/collision/collision-box-display.js
  NAME_TO_CLASS["CollisionBox"] = CollisionBox;		// lib/sprite/collision/collision-box.js
  NAME_TO_CLASS["CollisionMerger"] = CollisionMerger;		// lib/sprite/collision/collision-merger.js
  NAME_TO_CLASS["UiComponent"] = UiComponent;		// lib/ui/base/ui-component.js
  NAME_TO_CLASS["StartScreen"] = StartScreen;		// games/common/start-screen.js
  NAME_TO_CLASS["FlatLand"] = FlatLand;		// games/demo/flat-land.js
  NAME_TO_CLASS["GameRing"] = GameRing;		// games/demo/game-ring.js
  NAME_TO_CLASS["PeerDemo"] = PeerDemo;		// games/demo/peer-demo.js
  NAME_TO_CLASS["Smurf"] = Smurf;		// games/demo/smurf.js
  NAME_TO_CLASS["AnimalRoom"] = AnimalRoom;		// games/the-impossible-room/animal-room.js
  NAME_TO_CLASS["BatmanRoom"] = BatmanRoom;		// games/the-impossible-room/batman-room.js
  NAME_TO_CLASS["ClueRoom"] = ClueRoom;		// games/the-impossible-room/clue-room.js
  NAME_TO_CLASS["ComputerRoom"] = ComputerRoom;		// games/the-impossible-room/computer-room.js
  NAME_TO_CLASS["DesertExit"] = DesertExit;		// games/the-impossible-room/desert-exit.js
  NAME_TO_CLASS["DesertFar"] = DesertFar;		// games/the-impossible-room/desert-far.js
  NAME_TO_CLASS["DesertRoom"] = DesertRoom;		// games/the-impossible-room/desert-room.js
  NAME_TO_CLASS["Entrance"] = Entrance;		// games/the-impossible-room/entrance.js
  NAME_TO_CLASS["GameTitle"] = GameTitle;		// games/the-impossible-room/game-title.js
  NAME_TO_CLASS["GandalfRoom"] = GandalfRoom;		// games/the-impossible-room/gandalf-room.js
  NAME_TO_CLASS["ImpossibleRoom"] = ImpossibleRoom;		// games/the-impossible-room/impossible-room.js
  NAME_TO_CLASS["JokerRoom"] = JokerRoom;		// games/the-impossible-room/joker-room.js
  NAME_TO_CLASS["Lobby"] = Lobby;		// games/the-impossible-room/lobby.js
  NAME_TO_CLASS["LockedRoom"] = LockedRoom;		// games/the-impossible-room/locked-room.js
  NAME_TO_CLASS["Mall"] = Mall;		// games/the-impossible-room/mall.js
  NAME_TO_CLASS["MathRoom"] = MathRoom;		// games/the-impossible-room/math-room.js
  NAME_TO_CLASS["Menu"] = Menu;		// games/the-impossible-room/menu.js
  NAME_TO_CLASS["Restaurant"] = Restaurant;		// games/the-impossible-room/restaurant.js
  NAME_TO_CLASS["Restroom"] = Restroom;		// games/the-impossible-room/restroom.js
  NAME_TO_CLASS["Selection"] = Selection;		// games/the-impossible-room/selection.js
  NAME_TO_CLASS["SoundRoom"] = SoundRoom;		// games/the-impossible-room/sound-room.js
  NAME_TO_CLASS["Template"] = Template;		// games/the-impossible-room/template.js
  NAME_TO_CLASS["TimeRoom"] = TimeRoom;		// games/the-impossible-room/time-room.js
  NAME_TO_CLASS["TvRoom"] = TvRoom;		// games/the-impossible-room/tv-room.js
  NAME_TO_CLASS["TranslateVoice"] = TranslateVoice;		// lib/lang/translate-voice.js
  NAME_TO_CLASS["SpriteGrid"] = SpriteGrid;		// lib/map/sprite-grid.js
  NAME_TO_CLASS["Ng"] = Ng;		// lib/newgrounds/ng.js
  NAME_TO_CLASS["BufferRenderer"] = BufferRenderer;		// lib/opengl/buffer-renderer.js
  NAME_TO_CLASS["Shader"] = Shader;		// lib/opengl/shader.js
  NAME_TO_CLASS["Utils"] = Utils;		// lib/opengl/utils.js
  NAME_TO_CLASS["Collision"] = Collision;		// lib/physics/collision.js
  NAME_TO_CLASS["Control8"] = Control8;		// lib/physics/control-8.js
  NAME_TO_CLASS["Control"] = Control;		// lib/physics/control.js
  NAME_TO_CLASS["Movement"] = Movement;		// lib/physics/movement.js
  NAME_TO_CLASS["OverworldGravity"] = OverworldGravity;		// lib/physics/overworld-gravity.js
  NAME_TO_CLASS["PlatformGravity"] = PlatformGravity;		// lib/physics/platform-gravity.js
  NAME_TO_CLASS["PlatformJump"] = PlatformJump;		// lib/physics/platform-jump.js
  NAME_TO_CLASS["SpriteRenderer"] = SpriteRenderer;		// lib/renderer/sprite-renderer.js
  NAME_TO_CLASS["Music"] = Music;		// lib/sound/music.js
  NAME_TO_CLASS["Sound"] = Sound;		// lib/sound/sound.js
  NAME_TO_CLASS["VoiceManager"] = VoiceManager;		// lib/sound/voice-manager.js
  NAME_TO_CLASS["Hud"] = Hud;		// lib/sprite/hud.js
  NAME_TO_CLASS["PlatformBlock"] = PlatformBlock;		// lib/sprite/platform-block.js
  NAME_TO_CLASS["Shadow"] = Shadow;		// lib/sprite/shadow.js
  NAME_TO_CLASS["SpriteCollection"] = SpriteCollection;		// lib/sprite/sprite-collection.js
  NAME_TO_CLASS["SpriteFactory"] = SpriteFactory;		// lib/sprite/sprite-factory.js
  NAME_TO_CLASS["CollisionBoxCalculator"] = CollisionBoxCalculator;		// lib/texture/collision-box-calculator.js
  NAME_TO_CLASS["TextureAtlas"] = TextureAtlas;		// lib/texture/texture-atlas.js
  NAME_TO_CLASS["TextureManager"] = TextureManager;		// lib/texture/texture-manager.js
  NAME_TO_CLASS["DragDrop"] = DragDrop;		// lib/ui/drag-drop.js
  NAME_TO_CLASS["FocusFixer"] = FocusFixer;		// lib/ui/focus-fixer.js
  NAME_TO_CLASS["FpsBox"] = FpsBox;		// lib/ui/fps-box.js
  NAME_TO_CLASS["KeyboardHandler"] = KeyboardHandler;		// lib/ui/keyboard-handler.js
  NAME_TO_CLASS["PlayerOverlay"] = PlayerOverlay;		// lib/ui/player-overlay.js
  NAME_TO_CLASS["SceneTab"] = SceneTab;		// lib/ui/scene-tab.js
  NAME_TO_CLASS["SideBar"] = SideBar;		// lib/ui/side-bar.js
  NAME_TO_CLASS["TipBox"] = TipBox;		// lib/ui/tip-box.js
  NAME_TO_CLASS["ArrayUtils"] = ArrayUtils;		// lib/utils/array-utils.js
  NAME_TO_CLASS["Constants"] = Constants;		// lib/utils/constants.js
  NAME_TO_CLASS["RandomUtils"] = RandomUtils;		// lib/utils/random-utils.js
  NAME_TO_CLASS["String"] = String;		// lib/utils/string.js
  NAME_TO_CLASS["ValueRefresher"] = ValueRefresher;		// lib/utils/value-refresher.js
  NAME_TO_CLASS["Engine"] = Engine;		// lib/engine.js
});
function nameToClass(name) { if(!NAME_TO_CLASS[name]) console.warn('No class named ' + name); return NAME_TO_CLASS[name]; }
