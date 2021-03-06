import * as THREE from 'three';

var geometry = new THREE.BoxGeometry(1, 1, 1);
// move local coordinate system to scale the block properly
geometry.translate(0.5, 0.5, 0.5);

export class Block extends THREE.Mesh {
    constructor(color, name) {
        var material = new THREE.MeshLambertMaterial({color: color});
        super(geometry, material);

        this.name = name;
    }
}