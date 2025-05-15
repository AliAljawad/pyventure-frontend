import 'phaser';

export class Game extends Phaser.Scene {
    private player: Phaser.Physics.Arcade.Sprite;
    private pythonLogo: Phaser.Physics.Arcade.Sprite;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private map: Phaser.Tilemaps.Tilemap;
    private layer: Phaser.Tilemaps.TilemapLayer;
    private statusText: HTMLElement;
    private gameOver: boolean = false;
    private gameWon: boolean = false;

    constructor() {
        super('GameScene');
    }

    preload(): void {
        // Load assets
        this.load.image('tileset', 'tileset1.jpeg');
        this.load.tilemapCSV('map', 'level1.csv');
        this.load.image('player', 'player.jpg');
    }

    create(): void {
        // Create the tilemap
        this.map = this.make.tilemap({ key: 'map', tileWidth: 32, tileHeight: 32 });
        const tileset = this.map.addTilesetImage('tileset');
        
        // Create the layer
        this.layer = this.map.createLayer(0, tileset, 0, 0);
        
        // Set collision for platforms (tile indices 0-15)
        this.layer.setCollisionBetween(0, 15);
        
        // Configure special tiles (spikes, acid)
        this.map.forEachTile((tile) => {
            if (tile.index === 19) { // Spikes
                tile.setCollision(true, true, true, true);
                tile.properties.isSpike = true;
            } else if (tile.index === 23) { // Acid
                tile.setCollision(true, true, true, false);
                tile.properties.isAcid = true;
            }
        });
        
        // Create the player (using a sprite from the tileset)
        this.player = this.physics.add.sprite(100, 450, 'player', 24);
        this.player.setBounce(0.1);
        this.player.setCollideWorldBounds(true);
        
        // Find and create Python logo
        const logoPosition = this.findTilePosition(26);
        if (logoPosition) {
            this.pythonLogo = this.physics.add.sprite(logoPosition.x, logoPosition.y, 'player', 26);
            // Remove the tile from the map
            this.map.removeTileAt(logoPosition.tileX, logoPosition.tileY);
        }
        
        // Set up collisions
        this.physics.add.collider(this.player, this.layer, this.handleTileCollision, null, this);
        
        // Set up Python logo collection
        if (this.pythonLogo) {
            this.physics.add.overlap(this.player, this.pythonLogo, this.collectLogo, null, this);
        }
        
        // Create animations
        this.player = this.physics.add.sprite(100, 450, 'player');
        // Set up keyboard controls
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // Set up status text
        this.statusText = document.getElementById('status');
        
        // Configure camera
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        
        // Add restart key
        this.input.keyboard.on('keydown-R', () => {
            if (this.gameOver || this.gameWon) {
                this.scene.restart();
                this.gameOver = false;
                this.gameWon = false;
                if (this.statusText) this.statusText.textContent = '';
            }
        });
    }

    update(): void {
        if (this.gameOver || this.gameWon) {
            return;
        }
        
        // Handle player movement
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
            this.player.anims.play('left', true);
            this.player.flipX = true;
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
            this.player.anims.play('right', true);
            this.player.flipX = false;
        } else {
            this.player.setVelocityX(0);
            this.player.anims.play('idle', true);
        }
        
        // Handle jumping
        if (this.cursors.up.isDown && (this.player.body as Phaser.Physics.Arcade.Body).onFloor()) {
            this.player.setVelocityY(-350);
        }
        
        // Check for falling out of bounds
        if (this.player.y > this.cameras.main.height) {
            this.playerDied();
        }
    }

    // Helper function to handle tile collisions
    private handleTileCollision(player: Phaser.Physics.Arcade.Sprite, tile: Phaser.Tilemaps.Tile): void {
        if (tile.properties.isSpike || tile.properties.isAcid) {
            this.playerDied();
        }
    }

    // Helper function to collect Python logo
    private collectLogo(player: Phaser.Physics.Arcade.Sprite, logo: Phaser.Physics.Arcade.Sprite): void {
        logo.disableBody(true, true);
        
        if (this.statusText) {
            this.statusText.textContent = 'You collected the Python logo! You win!';
        }
        
        this.gameWon = true;
        
        // Add celebratory effect
        this.tweens.add({
            targets: player,
            y: player.y - 30,
            duration: 300,
            ease: 'Linear',
            yoyo: true,
            repeat: 2
        });
    }

    // Helper function for player death
    private playerDied(): void {
        this.gameOver = true;
        this.player.setTint(0xff0000);
        this.player.anims.play('idle');
        
        if (this.statusText) {
            this.statusText.textContent = 'Game Over! Press R to restart';
        }
    }

    // Helper function to find a tile position by index
    private findTilePosition(tileIndex: number): { tileX: number, tileY: number, x: number, y: number } | null {
        for (let y = 0; y < this.map.height; y++) {
            for (let x = 0; x < this.map.width; x++) {
                const tile = this.map.getTileAt(x, y);
                if (tile && tile.index === tileIndex) {
                    return {
                        tileX: x,
                        tileY: y,
                        x: x * 32 + 16, // Center of tile
                        y: y * 32 + 16  // Center of tile
                    };
                }
            }
        }
        return null;
    }
}

// Initialize the game
window.onload = () => {
    const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: 960,
        height: 640,
        parent: 'game-container',
        pixelArt: true,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 500 },
                debug: false
            }
        },
        scene: [Game]
    };
    
    new Phaser.Game(config);
};