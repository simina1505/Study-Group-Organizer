import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Alert } from "react-native";
import { CameraView, Camera } from "expo-camera";
import CustomButton from "../../../components/CustomButton";
import { FullWindowOverlay } from "react-native-screens";

function QRScanner() {
	const [hasPermission, setHasPermission] = useState(null);
	const [scanned, setScanned] = useState(true);
	const [showButton, setShowButton] = useState(true);

	useEffect(() => {
		const getCameraPermissions = async () => {
			const { status } = await Camera.requestCameraPermissionsAsync();
			setHasPermission(status === "granted");
		};

		getCameraPermissions();
	}, []);

	const handleBarcodeScanned = ({ type, data }) => {
		setScanned(true);
		setShowButton(false);
		Alert.alert(
			"Scan Successful",
			`Bar code with type ${type} and data ${data} has been scanned!`,
			[
				{
					text: "OK",
					onPress: () => setShowButton(true),
				},
			]
		);
	};

	if (hasPermission === null) {
		return <Text>Requesting for camera permission</Text>;
	}
	if (hasPermission === false) {
		return <Text>No access to camera</Text>;
	}

	return (
		<View style={styles.container}>
			<CameraView
				onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
				barcodeScannerSettings={{
					barcodeTypes: ["qr", "pdf417"],
				}}
				style={StyleSheet.absoluteFillObject}
			/>
			<View style={styles.overlay}>
				<View style={styles.overlayTop} />
				<View style={styles.overlayCenterRow}>
					<View style={styles.overlaySide} />
					<View style={styles.overlayCutout} />
					<View style={styles.overlaySide} />
				</View>
				<View style={styles.overlayBottom} />
			</View>
			<FullWindowOverlay></FullWindowOverlay>
			{showButton && (
				<View style={styles.buttonContainer}>
					<CustomButton
						title={"Tap to Scan the Code"}
						handlePress={() => {
							setScanned(false);
							setShowButton(false);
						}}
						containerStyles="m-6 bg-white"
						textStyles=" px-2 p-2"
					/>
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: "column",
		justifyContent: "flex-end",
	},
	overlay: {
		...StyleSheet.absoluteFillObject,
		justifyContent: "center",
		alignItems: "center",
	},
	overlayTop: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		width: "100%",
	},
	overlayCenterRow: {
		flexDirection: "row",
	},
	overlaySide: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
	overlayCutout: {
		width: 250,
		height: 250,
		borderRadius: 10,
		borderWidth: 2,
		borderColor: "yellow",
		borderStyle: "dotted",
	},
	overlayBottom: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		width: "100%",
	},
});

export default QRScanner;
