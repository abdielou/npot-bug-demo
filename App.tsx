import * as React from 'react';
import {
  PixelRatio,
  Platform
} from 'react-native';
import ExpoTHREE, { THREE } from 'expo-three'; // 2.2.2-alpha.1
import ExpoGraphics from 'expo-graphics'; // 0.0.3

export default class App extends React.Component<{}> {
  constructor(props: any) {
    super(props);
  }

  componentWillMount() {
    THREE.suppressExpoWarnings(true);
  }

  componentWillUnmount() {
    THREE.suppressExpoWarnings(false);
  }

  onShouldReloadContext = () => {
    return Platform.OS === 'android';
  };

  onContextCreate = async ({ gl }) => {
    const { drawingBufferWidth: width, drawingBufferHeight: height, } = gl;
    const scale = PixelRatio.get();

    // Renderer
    this.renderer = ExpoTHREE.createRenderer({ gl });
    this.renderer.setPixelRatio(scale);
    this.renderer.setSize(width / scale, height / scale);
    this.renderer.shadowMapEnabled = true;

    /// Standard Camera
    this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 10000);
    this.camera.position.set(0, 0, 5);
    this.camera.lookAt(0, 0, 0);

    await this.setupScene();

    this.setState({ contextIsCreated: true });
  };

  setupScene = async () => {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xFFFFFF);
    this.model = await this.getBody();
    let box = new THREE.Box3().setFromObject(this.model);
    box.getCenter(this.model.position);
    this.model.position.multiplyScalar(- 1);
    this.scene.add(this.model);
    this.setupLights();
  };

  setupLights = () => {
    // lights
    const directionalLightA = new THREE.DirectionalLight(0xffffff, 5);
    directionalLightA.position.set(1, 1, 1);
    this.scene.add(directionalLightA);

    const directionalLightB = new THREE.DirectionalLight(0xffeedd);
    directionalLightB.position.set(-1, -1, -1);
    this.scene.add(directionalLightB);

    const ambientLight = new THREE.AmbientLight(0x222222);
    this.scene.add(ambientLight);
  };

  getBody = async () => {
    const model = {
      'B-AO_iOS_HERO_Bruce_Wayne_Batman_Arkham_Origins_Body_D.png': require('./models/batman/B-AO_iOS_HERO_Bruce_Wayne_Batman_Arkham_Origins_Body_D.png'),
      'B-AO_iOS_HERO_Bruce_Wayne_Batman_Arkham_Origins.mtl': require('./models/batman/B-AO_iOS_HERO_Bruce_Wayne_Batman_Arkham_Origins.mtl'),
      //'B-AO_iOS_HERO_Bruce_Wayne_Batman_Arkham_Origins_Body_D.npot.png': require('./models/batman/B-AO_iOS_HERO_Bruce_Wayne_Batman_Arkham_Origins_Body_D.npot.png'),
      //'B-AO_iOS_HERO_Bruce_Wayne_Batman_Arkham_Origins.npot.mtl': require('./models/batman/B-AO_iOS_HERO_Bruce_Wayne_Batman_Arkham_Origins.npot.mtl'),
      'B-AO_iOS_HERO_Bruce_Wayne_Batman_Arkham_Origins.obj': require('./models/batman/B-AO_iOS_HERO_Bruce_Wayne_Batman_Arkham_Origins.obj'),
    };

    const mesh = await ExpoTHREE.loadAsync(
      [
        model['B-AO_iOS_HERO_Bruce_Wayne_Batman_Arkham_Origins.mtl'],
        //model['B-AO_iOS_HERO_Bruce_Wayne_Batman_Arkham_Origins.npot.mtl'],
        model['B-AO_iOS_HERO_Bruce_Wayne_Batman_Arkham_Origins.obj'],
      ],
      () => { },
      name => model[name]
    );

    mesh.traverse(async child => {
      if (child instanceof THREE.Mesh) {
        const tempGeo = new THREE.Geometry().fromBufferGeometry(child.geometry);
        tempGeo.mergeVertices();
        tempGeo.computeVertexNormals();
        tempGeo.computeFaceNormals();
        child.geometry = new THREE.BufferGeometry().fromGeometry(tempGeo);
        child.material.flatShading = false;
        child.material.side = THREE.FrontSide;
      }
    });

    return mesh;
  };

  onResize = ({ width, height }) => {
    const scale = PixelRatio.get();
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(scale);
    this.renderer.setSize(width, height);
  };

  onRender = delta => {
    this.model.rotation.y += 1 * delta;
    this.renderer.render(this.scene, this.camera);
  };

  render() {
    return (
      <ExpoGraphics.View
        style={{ flex: 1 }}
        onContextCreate={this.onContextCreate}
        onRender={this.onRender}
        onResize={this.onResize}
        onShouldReloadContext={this.onShouldReloadContext}
      />
    );
  }
}
