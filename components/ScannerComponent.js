import React, { Component } from 'react';
import { Text, View, StyleSheet, Button, SafeAreaView, Alert } from 'react-native';
import { connect } from 'react-redux';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { QR_CODE } from '@env';
import { postReward } from '../redux/ActionCreators';
import { postReset } from '../redux/ActionCreators';
import { postNewuser } from '../redux/ActionCreators';

const mapStateToProps = state => {
    return {
        newuser: state.newuser,
        rewards: state.rewards
    };
}

const mapDispatchToProps = {
    postReward: () => (postReward()),
    postReset: () => (postReset()),
    postNewuser: () => (postNewuser())
};

class Scanner extends Component {
    state = {
        hasCameraPermission: false,
        scanned: false
    };

    // Checks if user has given permission to use the camera and waits for a response 

    async componentDidMount() {
        this.getPermissionsAsync();
    };

    // After receiving permission, this sets hasCameraPermission state granted.

    getPermissionsAsync = async () => {
        const { status } = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({ hasCameraPermission: status === 'granted' });
    };

    // After scanning QR code, this redeems initial reward and adds reward to the newuser array in newuser reducer

    handleNewuser() {
        this.props.postNewuser()
        Alert.alert(
            'Thanks for downloading the app!',
            'Enjoy 20% off your first service!',
            [
                {
                    text: 'OK',
                    onPress: () => this.props.navigation.goBack()
                },
            ],
            { cancelable: false }
        );
    };

    // This adds reward to rewards array in rewards reducer after scanning QR code.

    handleReward() {
        this.props.postReward()
        Alert.alert(
            'Congratulations',
            'You earned a stamp!',
            [
                {
                    text: 'OK',
                    onPress: () => this.props.navigation.goBack()
                },
            ],
            { cancelable: false }
        );
    };

    // After getting six rewards and scanning the QR code, this sets the rewards array in rewards reducer to empty

    resetRewards() {
        this.props.postReset()
        Alert.alert(
            'Thanks for being a loyal customer!',
            'You get a discount on your massage today!',
            [
                {
                    text: 'OK',
                    onPress: () => this.props.navigation.goBack()
                },
            ],
            { cancelable: false }
        );
    };

    // When QR code is scanned, this checks to see if it matches. If it does, it then checks to see which method to call based on the length of newuser and rewards prop. It also sets state of scanned to true. This prevents it from scanning again.

    handleBarCodeScanned = ({ data }) => {
        const rewards = this.props.rewards.rewards
        const newuser = this.props.newuser.newuser
        this.setState({ scanned: true });
        if (data === QR_CODE && newuser.length < 1) {
            return this.handleNewuser()
        } else if (data === QR_CODE && rewards.length < 6) {
            return this.handleReward()
        } else if (data === QR_CODE && rewards.length >= 6) {
            return this.resetRewards()
        } else {
            console.log('ok')
        };
    };

    render() {
        const { hasCameraPermission, scanned } = this.state;

        if (hasCameraPermission === null) {
            return <Text>Requesting for camera permission</Text>;
        }
        if (hasCameraPermission === false) {
            return <Text>No access to camera</Text>;
        }
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.text}>
                    Scan Now
                </Text>
                <View style={styles.mainView}>
                    <BarCodeScanner
                        onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
                        style={StyleSheet.absoluteFillObject}
                    />

                    {scanned && (
                        <Button
                            title={'Tap to Scan Again'}
                            onPress={() => this.setState({ scanned: false })}
                        />
                    )}
                </View>
            </SafeAreaView>
        );
    };
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black'
    },
    mainView: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-end'
    },
    text: {
        color: 'yellow',
        backgroundColor: 'black',
        textAlign: 'center',
        fontSize: 50
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(Scanner);