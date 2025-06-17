import { useEffect, useRef, useCallback } from "react";
import Phaser from "phaser";

interface PhaserGameProps {
  onReachCheckpoint: () => void;
  onCollectAllStars?: () => void;
  level: number;
}

const PhaserGame = ({
  onReachCheckpoint,
  onCollectAllStars,
  level = 1,
}: PhaserGameProps) => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<Phaser.Game | null>(null);

  // Stabilize the callback to prevent unnecessary re-renders
  const stableOnReachCheckpoint = useCallback(() => {
    onReachCheckpoint();
  }, []);

  useEffect(() => {
    if (!gameContainerRef.current) return;

    // Configuration for our Phaser game
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: gameContainerRef.current,
      width: 800,
      height: 600,
      backgroundColor: "#0a0a23",
      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 400, x: 0 },
          debug: false,
        },
      },
      scene: {
        preload: preload,
        create: create,
        update: update,
      },
    };

    // Create the game instance
    gameInstanceRef.current = new Phaser.Game(config);

    // Game objects
    let player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    let cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    let map: Phaser.Tilemaps.Tilemap;
    let mainTileset: Phaser.Tilemaps.Tileset;
    let spikeTileset: Phaser.Tilemaps.Tileset;
    let rocketTileset: Phaser.Tilemaps.Tileset;
    let tileset2: Phaser.Tilemaps.Tileset;
    let platformLayer: Phaser.Tilemaps.TilemapLayer;
    let deadlyTiles: number[];
    let checkpointTiles: number[];
    let solidTiles: number[];
    let spawnX = 100;
    let spawnY = 100;
    let reachedCheckpoint = false;
    let lastDirection = "idle"; // Track last movement direction
    let currentAnimation = ""; // Track current animation to prevent constant restarting
    const characterScale = 0.6; // Adjust this value to resize character (0.5 = half size, 2.0 = double size)

    // Sound objects
    let checkpointSound: Phaser.Sound.BaseSound;
    let runningSound: Phaser.Sound.BaseSound;
    let deathSound: Phaser.Sound.BaseSound;
    let jumpSound: Phaser.Sound.BaseSound;
    let backgroundMusic: Phaser.Sound.BaseSound;
    let isRunning = false; // Track if running sound is playing
    let musicKey: string; // Track which music is playing

    // Preload game assets
    function preload(this: Phaser.Scene) {
      // Create loading bar
      const progressBar = this.add.graphics();
      const progressBox = this.add.graphics();
      progressBox.fillStyle(0x222222, 0.8);
      progressBox.fillRect(240, 270, 320, 50);

      const width = this.cameras.main.width;
      const height = this.cameras.main.height;
      const loadingText = this.make.text({
        x: width / 2,
        y: height / 2 - 50,
        text: "Loading...",
        style: {
          font: "20px monospace",
          color: "#ffffff",
        },
      });
      loadingText.setOrigin(0.5, 0.5);

      this.load.on("progress", (value: number) => {
        progressBar.clear();
        progressBar.fillStyle(0x9b87f5, 1);
        progressBar.fillRect(250, 280, 300 * value, 30);
      });

      this.load.on("complete", () => {
        progressBar.destroy();
        progressBox.destroy();
        loadingText.destroy();
      });

      // Load the CSV tilemap based on level
      this.load.tilemapCSV(
        `level${level}`,
        `assets/tilemaps/level${level}.csv`
      );

      // Load tileset images - matching your TMJ structure
      this.load.image("tileset", "assets/tilesets/tileSet.jpeg"); // firstgid: 1
      this.load.image("spike", "assets/tilesets/Spike.png"); // firstgid: 19
      this.load.image("tileset2", "assets/tilesets/python-logo.png"); // firstgid: 20

      // Load character sprites
      // Replace these paths with your actual character image paths
      this.load.image("player_idle", "assets/characters/player_idle.png"); // Standing/facing screen
      this.load.image("player_walk1", "assets/characters/player_walk1.png"); // Right foot forward
      this.load.image("player_walk2", "assets/characters/player_walk2.png"); // Left foot forward
      this.load.image(
        "player_standing",
        "assets/characters/player_standing.png"
      ); // Standing still
      this.load.image("rocket", "assets/tilesets/rocket.png");
      this.load.image("background", "assets/bg.png");

      // Load sound files
      // Update these paths to match your actual sound file locations
      this.load.audio("checkpoint", "assets/sounds/checkpoint.mp3"); // or .mp3, .ogg
      this.load.audio("running", "assets/sounds/running.mp3");
      this.load.audio("death", "assets/sounds/death.mp3");
      this.load.audio("jump", "assets/sounds/jumping.mp3");

      // Load background music files

      // Or use a single background music file for all levels
      this.load.audio("bgMusicMain", "assets/sounds/bg-music.mp3");
    }

    // Enhanced smoke particle effect with more particles and variety
    function createEnhancedSmokeEffect(
      scene: Phaser.Scene,
      x: number,
      y: number
    ) {
      // Create large smoke clouds (more particles)
      const smokeParticles: Phaser.GameObjects.Graphics[] = [];

      // Large smoke puffs
      for (let i = 0; i < 15; i++) {
        const smoke = scene.add.graphics();
        const size = Phaser.Math.Between(8, 15);
        const opacity = Phaser.Math.FloatBetween(0.6, 0.9);

        smoke.fillStyle(0x666666, opacity);
        smoke.fillCircle(0, 0, size);
        smoke.setPosition(
          x + Phaser.Math.Between(-30, 30),
          y + Phaser.Math.Between(-15, 15)
        );

        smokeParticles.push(smoke);

        // Animate each smoke particle with varied movement
        scene.tweens.add({
          targets: smoke,
          y: smoke.y - Phaser.Math.Between(60, 120),
          x: smoke.x + Phaser.Math.Between(-50, 50),
          alpha: { from: opacity, to: 0 },
          scaleX: { from: 1, to: Phaser.Math.FloatBetween(2, 3) },
          scaleY: { from: 1, to: Phaser.Math.FloatBetween(2, 3) },
          duration: Phaser.Math.Between(1000, 1800),
          ease: "Power2",
          onComplete: () => {
            smoke.destroy();
          },
        });
      }

      // Medium smoke particles
      for (let i = 0; i < 12; i++) {
        const puff = scene.add.graphics();
        const size = Phaser.Math.Between(5, 10);
        puff.fillStyle(0x888888, 0.7);
        puff.fillCircle(0, 0, size);
        puff.setPosition(
          x + Phaser.Math.Between(-25, 25),
          y + Phaser.Math.Between(-10, 10)
        );

        scene.tweens.add({
          targets: puff,
          y: puff.y - Phaser.Math.Between(40, 80),
          x: puff.x + Phaser.Math.Between(-40, 40),
          alpha: { from: 0.7, to: 0 },
          scaleX: { from: 0.8, to: 2.5 },
          scaleY: { from: 0.8, to: 2.5 },
          duration: Phaser.Math.Between(800, 1400),
          delay: Phaser.Math.Between(0, 200),
          ease: "Power1",
          onComplete: () => {
            puff.destroy();
          },
        });
      }

      // Small dust particles for detail
      for (let i = 0; i < 20; i++) {
        const dust = scene.add.graphics();
        const size = Phaser.Math.Between(2, 5);
        dust.fillStyle(0xaaaaaa, 0.8);
        dust.fillCircle(0, 0, size);
        dust.setPosition(
          x + Phaser.Math.Between(-40, 40),
          y + Phaser.Math.Between(-20, 20)
        );

        scene.tweens.add({
          targets: dust,
          y: dust.y - Phaser.Math.Between(30, 60),
          x: dust.x + Phaser.Math.Between(-60, 60),
          alpha: { from: 0.8, to: 0 },
          scaleX: { from: 1, to: 1.5 },
          scaleY: { from: 1, to: 1.5 },
          duration: Phaser.Math.Between(600, 1000),
          delay: Phaser.Math.Between(0, 300),
          ease: "Sine.easeOut",
          onComplete: () => {
            dust.destroy();
          },
        });
      }

      // Add some spark-like effects
      for (let i = 0; i < 8; i++) {
        const spark = scene.add.graphics();
        spark.fillStyle(0xffaa00, 0.9);
        spark.fillCircle(0, 0, 2);
        spark.setPosition(
          x + Phaser.Math.Between(-20, 20),
          y + Phaser.Math.Between(-10, 10)
        );

        scene.tweens.add({
          targets: spark,
          y: spark.y - Phaser.Math.Between(20, 40),
          x: spark.x + Phaser.Math.Between(-30, 30),
          alpha: { from: 0.9, to: 0 },
          duration: Phaser.Math.Between(400, 800),
          delay: Phaser.Math.Between(0, 100),
          ease: "Power2",
          onComplete: () => {
            spark.destroy();
          },
        });
      }
    }

    // Function to handle player death with fade effect
    function handlePlayerDeath(
      scene: Phaser.Scene,
      playerObj: Phaser.Physics.Arcade.Sprite
    ) {
      // Stop running sound if playing
      if (runningSound && runningSound.isPlaying) {
        runningSound.stop();
        isRunning = false;
      }

      // Stop and restart background music
      if (backgroundMusic && backgroundMusic.isPlaying) {
        backgroundMusic.stop();
        // Restart the background music after a brief delay
        scene.time.delayedCall(500, () => {
          startBackgroundMusic(scene);
        });
      }

      // Play death sound
      if (deathSound) {
        deathSound.play();
      }

      // Create enhanced smoke effect at player position
      createEnhancedSmokeEffect(scene, playerObj.x, playerObj.y);

      // Freeze player movement
      playerObj.body.enable = false;
      playerObj.setVelocity(0, 0);

      // Fade out the player
      scene.tweens.add({
        targets: playerObj,
        alpha: { from: 1, to: 0 },
        scaleX: { from: characterScale, to: characterScale * 0.5 },
        scaleY: { from: characterScale, to: characterScale * 0.5 },
        duration: 800,
        ease: "Power2",
        onComplete: () => {
          // After fade out, wait a moment then respawn
          scene.time.delayedCall(400, () => {
            // Reset player position and properties
            playerObj.setPosition(spawnX, spawnY - 10);
            playerObj.setVelocity(0, 0);
            playerObj.setTexture("player_idle");
            playerObj.setScale(characterScale);
            playerObj.setAlpha(1); // Reset alpha
            currentAnimation = "";

            // Re-enable physics after short delay
            scene.time.delayedCall(100, () => {
              playerObj.body.enable = true;
            });
          });
        },
      });
    }

    // Function to start background music
    function startBackgroundMusic(scene: Phaser.Scene) {
      // Stop any currently playing music
      if (backgroundMusic && backgroundMusic.isPlaying) {
        backgroundMusic.stop();
      }

      // Determine which music to play based on level
      // You can customize this logic based on your needs

      musicKey = "bgMusicMain"; // Default music for higher levels

      // Try to play level-specific music, fall back to main music if not available
      try {
        backgroundMusic = scene.sound.add(musicKey, {
          volume: 0.3, // Adjust volume (0.0 to 1.0)
          loop: true, // Loop the music
        });
        backgroundMusic.play();
      } catch (error) {
        // If level-specific music doesn't exist, use main background music
        try {
          backgroundMusic = scene.sound.add("bgMusicMain", {
            volume: 0.3,
            loop: true,
          });
          backgroundMusic.play();
        } catch (fallbackError) {
          console.warn("Background music not available");
        }
      }
    }

    // Function to stop background music
    function stopBackgroundMusic() {
      if (backgroundMusic && backgroundMusic.isPlaying) {
        backgroundMusic.stop();
      }
    }

    // Create game world
    function create(this: Phaser.Scene) {
      // Reset game state
      reachedCheckpoint = false;
      lastDirection = "idle";
      currentAnimation = "";
      isRunning = false;

      // Initialize sounds
      checkpointSound = this.sound.add("checkpoint", { volume: 0.7 });
      runningSound = this.sound.add("running", {
        volume: 0.7,
        loop: true, // Loop the running sound
      });
      deathSound = this.sound.add("death", { volume: 0.8 });
      jumpSound = this.sound.add("jump", { volume: 2 });

      // Start background music
      startBackgroundMusic(this);

      // Create the tilemap from CSV
      map = this.make.tilemap({
        key: `level${level}`,
        tileWidth: 32,
        tileHeight: 32,
      });

      const background = this.add.image(0, 0, "background");
      background.setOrigin(0, 0); // Set origin to top-left
      background.setDisplaySize(map.widthInPixels, map.heightInPixels); // Scale to match map size
      background.setDepth(-1); // Put it behind everything else

      // Add tilesets with correct firstgid values matching your TMJ
      mainTileset = map.addTilesetImage("tileset", "tileset", 32, 32, 0, 0, 0); // firstgid: 1
      spikeTileset = map.addTilesetImage("spike", "spike", 32, 32, 0, 0, 18); // firstgid: 19
      tileset2 = map.addTilesetImage("tileset2", "tileset2", 32, 32, 0, 0, 19); // firstgid: 20
      rocketTileset = map.addTilesetImage("rocket", "rocket", 32, 32, 0, 0, 20); // firstgid: 21

      // Create the layer with all tilesets
      platformLayer = map.createLayer(
        0,
        [mainTileset, spikeTileset, tileset2, rocketTileset],
        0,
        0
      );

      // Define tile types based on your CSV data
      // From your CSV: solid tiles are 1,3,4,5,12,13,14,15,18
      solidTiles = [
        1, 3, 5, 6, 12, 13, 14, 11, 15, 25, 26, 27, 28, 33, 34, 35, 36, 42, 43,
        44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61,
        62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79,
        80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91,
      ];

      // Spike tiles (firstgid 19 in your TMJ)
      deadlyTiles = [18, 4];

      // Checkpoint tiles (firstgid 20 in your TMJ, which is your python logo)
      checkpointTiles = [19];

      // Set collision for solid tiles
      platformLayer.setCollision(solidTiles);

      // Find spawn point - look for an empty area at the start
      spawnX = 64;
      spawnY = 200; // Adjust based on your map layout

      // Create player with idle sprite and apply scale
      player = this.physics.add.sprite(spawnX, spawnY, "player_idle");
      player.setScale(characterScale); // Resize the character
      player.setBounce(0.2);
      player.setCollideWorldBounds(true);

      // Fixed: Better physics settings for stopping
      player.setDrag(600, 0); // Increased horizontal drag for quicker stopping
      player.setMaxVelocity(120, 500); // Set max velocities

      // Adjust physics body size to match the scaled sprite
      // This ensures collision detection works properly with the resized character
      this.physics.world.on("worldstep", () => {
        if (player.body) {
          const body = player.body as Phaser.Physics.Arcade.Body;
          body.setSize(
            player.width * characterScale, // Slightly smaller hitbox for more forgiving gameplay
            player.height * characterScale,
            true // Center the body
          );
        }
      });

      // Create walking animation
      this.anims.create({
        key: "walk_right",
        frames: [{ key: "player_walk1" }, { key: "player_walk2" }],
        frameRate: 8, // Adjust speed of animation
        repeat: -1, // Loop forever
      });

      this.anims.create({
        key: "walk_left",
        frames: [{ key: "player_walk1" }, { key: "player_walk2" }],
        frameRate: 8,
        repeat: -1,
      });

      this.anims.create({
        key: "idle",
        frames: [{ key: "player_idle" }],
        frameRate: 1,
      });

      this.anims.create({
        key: "standing",
        frames: [{ key: "player_standing" }],
        frameRate: 1,
      });

      // Add collision between player and platform layer
      this.physics.add.collider(player, platformLayer);

      // Check for deadly tiles (spikes)
      this.physics.add.overlap(player, platformLayer, (playerObj, tile) => {
        const tileObj = tile as Phaser.Tilemaps.Tile;

        if (
          deadlyTiles.includes(tileObj.index) &&
          playerObj instanceof Phaser.Physics.Arcade.Sprite
        ) {
          // Use the enhanced death effect
          handlePlayerDeath(this, playerObj);
        }
      });

      // Check for checkpoint tiles (python logo)
      this.physics.add.overlap(player, platformLayer, (player, tile) => {
        const tileObj = tile as Phaser.Tilemaps.Tile;
        if (checkpointTiles.includes(tileObj.index) && !reachedCheckpoint) {
          reachedCheckpoint = true;

          // Play checkpoint sound
          if (checkpointSound) {
            checkpointSound.play();
          }

          // Stop running sound if playing
          if (runningSound && runningSound.isPlaying) {
            runningSound.stop();
            isRunning = false;
          }

          stableOnReachCheckpoint();
        }
      });

      // Input
      cursors = this.input.keyboard.createCursorKeys();

      // Add music control keys (M to mute/unmute)
      const keyM = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
      keyM.on("down", () => {
        if (backgroundMusic) {
          if (backgroundMusic.isPlaying) {
            backgroundMusic.pause();
          } else {
            backgroundMusic.resume();
          }
        }
      });

      // Camera follows player
      this.cameras.main.startFollow(player);
      this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

      // Add instructions
      // Display on-screen instructions
      const instructions = this.add
        .text(16, 16, "", {
          font: "16px monospace",
          color: "#ffffff",
          backgroundColor: "rgba(0,0,0,0.5)",
          padding: { x: 10, y: 6 },
          wordWrap: { width: 770 },
        })
        .setScrollFactor(0); // Fix text to camera

      instructions.setText([
        "Controls:",
        "← → Arrow keys to move",
        "↑ Arrow key to jump",
        "M to mute/unmute music",
        "⚠️ Avoid the spikes!",
        "🐍 Find the Python logo!",
      ]);

      // Add level title
      const levelTitle = this.add
        .text(this.cameras.main.width / 2, 50, `Level ${level}`, {
          font: "bold 24px monospace",
          color: "#ffffff",
          backgroundColor: "rgba(0,0,0,0.5)",
          padding: { x: 16, y: 8 },
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(100);

      // Make it fade out after a few seconds
      this.tweens.add({
        targets: levelTitle,
        alpha: { from: 1, to: 0 },
        delay: 3000,
        duration: 1000,
        onComplete: () => {
          levelTitle.destroy();
        },
      });
    }

    // Game loop
    function update(this: Phaser.Scene) {
      // Player movement
      const acceleration = 400; // Increased for more responsive movement

      if (cursors.left.isDown) {
        player.setAccelerationX(-acceleration);

        // Handle running sound
        if (!isRunning && player.body.blocked.down) {
          if (runningSound) {
            runningSound.play();
            isRunning = true;
          }
        }

        // Handle animation and flipping for left movement
        if (currentAnimation !== "walk_left") {
          player.play("walk_left");
          player.setFlipX(true); // Flip sprite to face left
          currentAnimation = "walk_left";
        }
        lastDirection = "left";
      } else if (cursors.right.isDown) {
        player.setAccelerationX(acceleration);

        // Handle running sound
        if (!isRunning && player.body.blocked.down) {
          if (runningSound) {
            runningSound.play();
            isRunning = true;
          }
        }

        // Handle animation for right movement
        if (currentAnimation !== "walk_right") {
          player.play("walk_right");
          player.setFlipX(false); // Don't flip sprite for right movement
          currentAnimation = "walk_right";
        }
        lastDirection = "right";
      } else {
        // Fixed: Set acceleration to 0 for immediate stopping effect
        player.setAccelerationX(0);

        // Stop running sound when not moving
        if (isRunning && runningSound && runningSound.isPlaying) {
          runningSound.stop();
          isRunning = false;
        }

        // Handle idle animation - only change if we're on ground and not already idle
        if (player.body.blocked.down && currentAnimation !== "idle") {
          player.play("idle");
          currentAnimation = "idle";
        }

        // If player is moving very slowly, stop them completely
        if (Math.abs(player.body.velocity.x) < 5) {
          player.setVelocityX(0);
        }
      }

      // Jumping
      if (cursors.up.isDown && player.body.blocked.down) {
        player.setVelocityY(-300);

        // Play jump sound
        if (jumpSound) {
          jumpSound.play();
        }

        // Stop running sound when jumping
        if (isRunning && runningSound && runningSound.isPlaying) {
          runningSound.stop();
          isRunning = false;
        }

        // You could add a jumping sprite here if you have one
        // player.setTexture("player_jump");
      }

      // Stop running sound if player is in the air
      if (
        !player.body.blocked.down &&
        isRunning &&
        runningSound &&
        runningSound.isPlaying
      ) {
        runningSound.stop();
        isRunning = false;
      }

      // Check if player fell off the world
      if (player.y > map.heightInPixels + 100) {
        // Use the enhanced death effect for falling off the world too
        handlePlayerDeath(this, player);
      }
    }

    // Cleanup function
    return () => {
      // Stop background music when component unmounts
      stopBackgroundMusic();

      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy(true);
        gameInstanceRef.current = null;
      }
    };
  }, [level]); // Only depend on level changes

  return (
    <div className="relative">
      <div ref={gameContainerRef} className="w-full h-full" />
    </div>
  );
};

export default PhaserGame;
