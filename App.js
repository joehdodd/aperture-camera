import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Slider,
  CameraRoll,
  Dimensions
} from 'react-native';
import { Camera, Permissions, ImageManipulator } from 'expo';
let { height: screenHeight, width: screenWidth } = Dimensions.get('window');

const flashModeOrder = {
  off: 'on',
  on: 'auto',
  auto: 'torch',
  torch: 'off'
};

const wbOrder = {
  auto: 'sunny',
  sunny: 'cloudy',
  cloudy: 'shadow',
  shadow: 'fluorescent',
  fluorescent: 'incandescent',
  incandescent: 'auto'
};

export default class CameraScreen extends React.Component {
  state = {
    flash: 'off',
    zoom: 0,
    autoFocus: 'on',
    depth: 0,
    type: 'back',
    whiteBalance: 'auto',
    isRecording: false,
    orientation: ''
  };

  toggleFacing() {
    this.setState({
      type: this.state.type === 'back' ? 'front' : 'back'
    });
  }

  toggleFlash() {
    this.setState({
      flash: flashModeOrder[this.state.flash]
    });
  }

  toggleWB() {
    this.setState({
      whiteBalance: wbOrder[this.state.whiteBalance]
    });
  }

  toggleFocus() {
    this.setState({
      autoFocus: this.state.autoFocus === 'on' ? 'off' : 'on'
    });
  }

  zoomOut() {
    this.setState({
      zoom: this.state.zoom - 0.1 < 0 ? 0 : this.state.zoom - 0.1
    });
  }

  zoomIn() {
    this.setState({
      zoom: this.state.zoom + 0.1 > 1 ? 1 : this.state.zoom + 0.1
    });
  }

  setFocusDepth(depth) {
    this.setState({
      depth
    });
  }

  takePicture = async function() {
    if (this.camera) {
      let photo = await this.camera.takePictureAsync({
        exif: true
      });
      console.log('photo exif', photo);
      console.log('ImageManipulator', ImageManipulator.manipulateAsync);
      let orientation = photo.exif.Orientation;
      photo = await ImageManipulator.manipulateAsync(photo.uri, [
        {
          rotate: orientation + -orientation
        }
        // {
        //   resize: {
        //     width: photo.width,
        //     height: photo.height
        //   }
        // }
      ]);
      await CameraRoll.saveToCameraRoll(photo.uri, 'photo');
    }
  };

  takeVideo = async function() {
    if (this.camera) {
      try {
        const promise = this.camera.recordAsync(this.state.recordOptions);

        if (promise) {
          this.setState({ isRecording: true });
          const data = await promise;
          this.setState({ isRecording: false });
          console.warn('takeVideo', data);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  renderCamera() {
    return (
      <Camera
        ref={ref => {
          this.camera = ref;
        }}
        style={{
          width: screenWidth,
          height: screenWidth * 1.33,
        }}
        type={this.state.type}
        flashMode={this.state.flash}
        autoFocus={this.state.autoFocus}
        // zoom={this.state.zoom}
        whiteBalance={this.state.whiteBalance}
        ratio={this.state.ratio}
        focusDepth={this.state.depth}
        permissionDialogTitle={'Permission to use camera'}
        permissionDialogMessage={
          'We need your permission to use your camera phone'
        }
      >
        <View
          style={{
            flex: 0.5,
            backgroundColor: 'transparent',
            flexDirection: 'row',
            justifyContent: 'space-around'
          }}
        >
          <TouchableOpacity
            style={styles.flipButton}
            onPress={this.toggleFacing.bind(this)}
          >
            <Text style={styles.flipText}> FLIP </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.flipButton}
            onPress={this.toggleFlash.bind(this)}
          >
            <Text style={styles.flipText}> FLASH: {this.state.flash} </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.flipButton}
            onPress={this.toggleWB.bind(this)}
          >
            <Text style={styles.flipText}> WB: {this.state.whiteBalance} </Text>
          </TouchableOpacity>
        </View>
        <View
          style={{
            flex: 0.4,
            backgroundColor: 'transparent',
            flexDirection: 'row',
            alignSelf: 'flex-end'
          }}
        >
          <Slider
            style={{ width: 150, marginTop: 15, alignSelf: 'flex-end' }}
            onValueChange={this.setFocusDepth.bind(this)}
            step={0.1}
            disabled={this.state.autoFocus === 'on'}
          />
        </View>
        <View
          style={{
            flex: 0.1,
            backgroundColor: 'transparent',
            flexDirection: 'row',
            alignSelf: 'flex-end'
          }}
        >
          <TouchableOpacity
            style={[
              styles.flipButton,
              {
                flex: 0.3,
                alignSelf: 'flex-end',
                backgroundColor: this.state.isRecording ? 'white' : 'darkred'
              }
            ]}
            onPress={
              this.state.isRecording ? () => {} : this.takeVideo.bind(this)
            }
          >
            {this.state.isRecording ? (
              <Text style={styles.flipText}> ☕ </Text>
            ) : (
              <Text style={styles.flipText}> REC </Text>
            )}
          </TouchableOpacity>
        </View>
        {this.state.zoom !== 0 && (
          <Text style={[styles.flipText, styles.zoomText]}>
            Zoom: {this.state.zoom}
          </Text>
        )}
        <View
          style={{
            flex: 0.1,
            backgroundColor: 'transparent',
            flexDirection: 'row',
            alignSelf: 'flex-end'
          }}
        >
          <TouchableOpacity
            style={[styles.flipButton, { flex: 0.1, alignSelf: 'flex-end' }]}
            onPress={this.zoomIn.bind(this)}
          >
            <Text style={styles.flipText}> + </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.flipButton, { flex: 0.1, alignSelf: 'flex-end' }]}
            onPress={this.zoomOut.bind(this)}
          >
            <Text style={styles.flipText}> - </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.flipButton, { flex: 0.25, alignSelf: 'flex-end' }]}
            onPress={this.toggleFocus.bind(this)}
          >
            <Text style={styles.flipText}> AF : {this.state.autoFocus} </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.flipButton,
              styles.picButton,
              { flex: 0.3, alignSelf: 'flex-end' }
            ]}
            onPress={this.takePicture.bind(this)}
          >
            <Text style={styles.flipText}> SNAP </Text>
          </TouchableOpacity>
        </View>
      </Camera>
    );
  }

  getOrientation = () => {
    if (this.refs.rootView) {
      if (Dimensions.get('window').width < Dimensions.get('window').height) {
        this.setState({ orientation: 'portrait' });
      } else {
        this.setState({ orientation: 'landscape' });
      }
    }
  };

  componentDidMount() {
    Dimensions.addEventListener('change', () => {
      console.log('orientation change');
    });
  }

  render() {
    return <View style={styles.container}>{this.renderCamera()}</View>;
  }
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 64,
    flex: 1,
    backgroundColor: 'transparent'
  },
  flipButton: {
    flex: 0.3,
    height: 40,
    marginHorizontal: 2,
    marginBottom: 10,
    marginTop: 20,
    borderRadius: 8,
    borderColor: 'white',
    borderWidth: 1,
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  flipText: {
    color: 'white',
    fontSize: 15
  },
  zoomText: {
    position: 'absolute',
    bottom: 70,
    zIndex: 2,
    left: 2
  },
  picButton: {
    backgroundColor: 'darkseagreen'
  }
});
