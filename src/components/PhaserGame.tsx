import { useEffect, useRef } from "react";
import Phaser from "phaser";

interface PhaserGameProps {
  onReachCheckpoint: () => void;
  onCollectAllStars?: () => void;
}

const PhaserGame = ({
  onReachCheckpoint,
  onCollectAllStars,
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
          gravity: { y: 300, x: 0 },
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

    // Preload game assets
    function preload(this: Phaser.Scene) {
      // Creating a loading bar
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

      // Instead of loading assets, we'll create them programmatically for testing
      this.load.on("complete", () => {
        // Create ground texture
        const groundGraphics = this.make.graphics({ x: 0, y: 0 });
        groundGraphics.fillStyle(0x663300);
        groundGraphics.fillRect(0, 0, 100, 100);
        groundGraphics.lineStyle(2, 0x441100);
        groundGraphics.strokeRect(0, 0, 100, 100);
        groundGraphics.generateTexture("ground", 100, 100);

        // Create sky texture
        const skyGraphics = this.make.graphics({ x: 0, y: 0 });
        skyGraphics.fillGradientStyle(0x3498db, 0x3498db, 0x0a3d62, 0x0a3d62);
        skyGraphics.fillRect(0, 0, 100, 100);
        skyGraphics.generateTexture("sky", 100, 100);

        // Create star texture
        const starGraphics = this.make.graphics({ x: 0, y: 0 });
        starGraphics.fillStyle(0xffff00);
        starGraphics.fillCircle(12, 12, 10);
        starGraphics.generateTexture("star", 24, 24);

        // Create checkpoint texture
        const checkpointGraphics = this.make.graphics({
          x: 0,
          y: 0,
        });
        checkpointGraphics.fillStyle(0xff0000);
        checkpointGraphics.fillRect(0, 0, 24, 24);
        checkpointGraphics.generateTexture("checkpoint", 24, 24);
      });

      // Trigger the complete event manually since we're not loading external assets
      this.load.start();
    }

    // Game objects
    let player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    let stars: Phaser.Physics.Arcade.Group;
    let checkpoints: Phaser.Physics.Arcade.StaticGroup;
    let cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    let score = 0;
    let scoreText: Phaser.GameObjects.Text;
    let starCount = 0;
    let starsCollected = 0;
    let reachedCheckpoint = false;
    let gameOver = false;

    // Create game world
    function create(this: Phaser.Scene) {
      // Reset game state
      score = 0;
      starsCollected = 0;
      reachedCheckpoint = false;
      gameOver = false;

      // Add a sky background
      this.add.image(400, 300, "sky").setDisplaySize(800, 600);

      // Create platforms group with physics
      const platforms = this.physics.add.staticGroup();

      // Create the ground
      platforms
        .create(400, 568, "ground")
        .setDisplaySize(800, 32)
        .refreshBody();

      // Create some platforms
      platforms
        .create(600, 400, "ground")
        .setDisplaySize(200, 32)
        .refreshBody();
      platforms.create(50, 250, "ground").setDisplaySize(200, 32).refreshBody();
      platforms
        .create(750, 220, "ground")
        .setDisplaySize(200, 32)
        .refreshBody();

      // Create player
      player = this.physics.add.sprite(100, 450, "star").setDisplaySize(32, 32);
      player.setBounce(0.2);
      player.setCollideWorldBounds(true);
      player.setTint(0x9b87f5);
      player.setDamping(true);
      player.setDrag(0.9, 0);

      // Create stars
      stars = this.physics.add.group({
        key: "star",
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 },
      });

      starCount = stars.getChildren().length;

      stars.children.iterate((child) => {
        const c = child as Phaser.Physics.Arcade.Image;
        c.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        c.setDisplaySize(24, 24);
        c.setTint(0xffff00);
        return null;
      });

      // Create checkpoint
      checkpoints = this.physics.add.staticGroup();
      const checkpoint = checkpoints.create(750, 180, "checkpoint");
      checkpoint.setDisplaySize(32, 32);
      checkpoint.refreshBody();
      checkpoint.setTint(0xff0000);

      // Add score text
      scoreText = this.add.text(16, 16, "Score: 0", {
        fontSize: "32px",
        color: "#ffffff",
      });

      // Add collision between player and platforms
      this.physics.add.collider(player, platforms);
      this.physics.add.collider(stars, platforms);

      // Check for overlap between player and stars
      this.physics.add.overlap(
        player,
        stars,
        (obj1, obj2) => {
          // Inside this function, we know what the types should be
          const star = obj2 as Phaser.Physics.Arcade.Image;
          star.disableBody(true, true);
          score += 10;
          starsCollected++;
          scoreText.setText("Score: " + score);

          // Check if all stars are collected
          if (starsCollected === starCount && onCollectAllStars) {
            onCollectAllStars();
          }
        },
        undefined,
        this
      );

      // Check for overlap between player and checkpoint
      this.physics.add.overlap(
        player,
        checkpoints,
        () => {
          if (!reachedCheckpoint) {
            reachedCheckpoint = true;
            checkpoint.setTint(0x00ff00);
            onReachCheckpoint();

            // Create completion text
            if (starsCollected === starCount) {
              const completionText = this.add.text(
                400,
                300,
                "Level Complete!",
                { fontSize: "48px", color: "#ffffff" }
              );
              completionText.setOrigin(0.5);
              completionText.setShadow(2, 2, "#000000", 2);

              // Make it flash
              this.tweens.add({
                targets: completionText,
                alpha: { from: 1, to: 0.5 },
                yoyo: true,
                repeat: -1,
                duration: 500,
              });

              gameOver = true;
            }
          }
        },
        undefined,
        this
      );

      // Input
      cursors = this.input.keyboard.createCursorKeys();
    }

    // Game loop
    function update(this: Phaser.Scene) {
      if (gameOver) return;

      // Player movement - improved with acceleration
      const acceleration = 800;
      const maxSpeed = 160;

      if (cursors.left.isDown) {
        player.setAccelerationX(-acceleration);
        if (player.body.velocity.x < -maxSpeed) {
          player.setVelocityX(-maxSpeed);
        }
      } else if (cursors.right.isDown) {
        player.setAccelerationX(acceleration);
        if (player.body.velocity.x > maxSpeed) {
          player.setVelocityX(maxSpeed);
        }
      } else {
        player.setAccelerationX(0);
      }

      if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-330);
      }
    }

    // Cleanup function
    return () => {
      if (gameInstanceRef.current) {
        gameInstanceRef.current.destroy(true);
        gameInstanceRef.current = null;
      }
    };
  }, [onReachCheckpoint, onCollectAllStars]);

  return (
    <div className="relative">
      <div ref={gameContainerRef} className="w-full h-full" />
      <div className="absolute bottom-4 left-4 bg-black/50 p-2 rounded-md">
        <div className="text-sm text-white">
          <p>Use arrow keys to move</p>
          <p>Collect stars and reach the red checkpoint</p>
        </div>
      </div>
    </div>
  );
};

export default PhaserGame;
