import { useEffect, useRef } from "react";
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
        `../../public/assets/tilemaps/level${level}.csv`
      );

      // Load tileset images - matching your TMJ structure
      this.load.image("tileset", "../../public/assets/tilesets/tileSet.jpeg"); // firstgid: 1
      this.load.image("spike", "../../public/assets/tilesets/Spike.png"); // firstgid: 19
      this.load.image(
        "tileset2",
        "../../public/assets/tilesets/python-logo.png"
      ); // firstgid: 20

      // Load character sprites
      // Replace these paths with your actual character image paths
      this.load.image(
        "player_idle",
        "../../public/assets/characters/player_idle.png"
      ); // Standing/facing screen
      this.load.image(
        "player_walk1",
        "../../public/assets/characters/player_walk1.png"
      ); // Right foot forward
      this.load.image(
        "player_walk2",
        "../../public/assets/characters/player_walk2.png"
      ); // Left foot forward
      this.load.image(
        "player_standing",
        "../../public/assets/characters/player_standing.png"
      ); // Standing still
    }

    // Create game world
    function create(this: Phaser.Scene) {
      // Reset game state
      reachedCheckpoint = false;
      lastDirection = "idle";
      currentAnimation = "";

      // Create the tilemap from CSV
      map = this.make.tilemap({
        key: `level${level}`,
        tileWidth: 32,
        tileHeight: 32,
      });

      // Add tilesets with correct firstgid values matching your TMJ
      mainTileset = map.addTilesetImage("tileset", "tileset", 32, 32, 0, 0, 0); // firstgid: 1
      spikeTileset = map.addTilesetImage("spike", "spike", 32, 32, 0, 0, 18); // firstgid: 19
      tileset2 = map.addTilesetImage("tileset2", "tileset2", 32, 32, 0, 0, 19); // firstgid: 20

      // Create the layer with all tilesets
      platformLayer = map.createLayer(
        0,
        [mainTileset, spikeTileset, tileset2],
        0,
        0
      );

      // Define tile types based on your CSV data
      // From your CSV: solid tiles are 1,3,4,5,12,13,14,15,18
      solidTiles = [1, 3, 5, 12, 13, 14, 15];

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
          // Shake and flash
          this.cameras.main.shake(250, 0.02);
          this.cameras.main.flash(250, 255, 0, 0);

          // Create red overlay
          // Create red overlay that always fills the screen
          const redOverlay = this.add
            .rectangle(
              0,
              0,
              this.cameras.main.width,
              this.cameras.main.height,
              0xff0000,
              0.3
            )
            .setOrigin(0)
            .setScrollFactor(0)
            .setDepth(1000); // Ensure it's above everything

          // Show "You Died!" text centered on screen
          const deathText = this.add
            .text(
              this.cameras.main.width / 2,
              this.cameras.main.height / 2,
              "You Died!",
              {
                fontSize: "40px",
                color: "#ff0000",
                fontStyle: "bold",
                stroke: "#000",
                strokeThickness: 4,
              }
            )
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(1001); // Make sure it's above the overlay

          // Freeze player
          playerObj.body.enable = false;

          this.time.delayedCall(1000, () => {
            playerObj.setPosition(spawnX, spawnY - 10); // Slightly above the ground
            playerObj.setVelocity(0, 0);
            playerObj.setTexture("player_idle");
            playerObj.setScale(characterScale);
            currentAnimation = "";

            this.time.delayedCall(50, () => {
              playerObj.body.enable = true; // Re-enable after short delay
            });

            redOverlay.destroy();
            deathText.destroy();
          });
        }
      });

      // Check for checkpoint tiles (python logo)
      this.physics.add.overlap(player, platformLayer, (player, tile) => {
        const tileObj = tile as Phaser.Tilemaps.Tile;
        if (checkpointTiles.includes(tileObj.index) && !reachedCheckpoint) {
          reachedCheckpoint = true;

          // Visual feedback for reaching checkpoint
          this.cameras.main.flash(500, 0, 255, 0);

          // Change checkpoint tile color
          tileObj.tint = 0x00ff00;

          // Create completion text
          const completionText = this.add.text(
            400,
            100,
            "Checkpoint Reached!",
            {
              fontSize: "32px",
              color: "#00ff00",
              fontStyle: "bold",
            }
          );
          completionText.setOrigin(0.5);
          completionText.setShadow(2, 2, "#000000", 2);

          // Make it flash
          this.tweens.add({
            targets: completionText,
            alpha: { from: 1, to: 0.5 },
            yoyo: true,
            repeat: 3,
            duration: 300,
            onComplete: () => {
              completionText.destroy();
            },
          });

          onReachCheckpoint();
        }
      });

      // Input
      cursors = this.input.keyboard.createCursorKeys();

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

        // Handle animation and flipping for left movement
        if (currentAnimation !== "walk_left") {
          player.play("walk_left");
          player.setFlipX(true); // Flip sprite to face left
          currentAnimation = "walk_left";
        }
        lastDirection = "left";
      } else if (cursors.right.isDown) {
        player.setAccelerationX(acceleration);

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
        // You could add a jumping sprite here if you have one
        // player.setTexture("player_jump");
      }

      // Check if player fell off the world
      if (player.y > map.heightInPixels + 100) {
        // Respawn player
        player.setPosition(spawnX, spawnY);
        player.setVelocity(0, 0);
        player.setTexture("player_idle");
        player.setScale(characterScale); // Maintain scale after respawn
        lastDirection = "idle";
        currentAnimation = ""; // Reset animation tracking
      }
    }

    // Cleanup function
    return () => {
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy(true);
        gameInstanceRef.current = null;
      }
    };
  }, [onReachCheckpoint, onCollectAllStars, level]);

  return (
    <div className="relative">
      <div ref={gameContainerRef} className="w-full h-full" />
    </div>
  );
};

export default PhaserGame;
