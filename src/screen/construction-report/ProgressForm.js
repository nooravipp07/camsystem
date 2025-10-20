import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	Modal,
	TextInput,
	Alert,
	Image,
} from "react-native";
import * as Progress from "react-native-progress";
import { launchImageLibrary } from "react-native-image-picker";

const progressDataInit = [
	{ title: "A. PEKERJAAN PERSIAPAN, GALIAN DAN URUGAN", realisasi: 0.0, bobot: 0.1 },
	{ title: "B. PEKERJAAN PONDASI, DINDING DAN BETON BERTULANG", realisasi: 0.5, bobot: 0.1 },
	{ title: "C. PEKERJAAN KUSEN PINTU/JENDELA (LENGKAP AKSESORIS)", realisasi: 0.0, bobot: 0.1 },
	{ title: "D. PEKERJAAN ATAP, PLAFOND DAN RANGKA", realisasi: 0.0, bobot: 0.1 },
	{ title: "E. PEKERJAAN LANTAI", realisasi: 0.0, bobot: 0.1 },
	{ title: "F. PEKERJAAN KAMAR MANDI & SANITAIR", realisasi: 0.0, bobot: 0.1 },
	{ title: "G. PEKERJAAN PENGECATAN", realisasi: 0.0, bobot: 0.1 },
	{ title: "H. PEKERJAAN INSTALASI LISTRIK & AIR", realisasi: 0.0, bobot: 0.1 },
	{ title: "I. FIRE PROTECTION", realisasi: 0.0, bobot: 0.1 },
	{ title: "J. PENANGKAL PETIR", realisasi: 0.0, bobot: 0.1 },
	{ title: "K. PEKERJAAN LAIN - LAIN", realisasi: 0.0, bobot: 0.1 },
];

const ProgressForm = ({ navigation }) => {
	const [progressData, setProgressData] = useState(progressDataInit);
	const [selectedIndex, setSelectedIndex] = useState(null);
	const [inputValue, setInputValue] = useState("");
	const [modalVisible, setModalVisible] = useState(false);
	const [lampiran, setLampiran] = useState([]);

	const totalProgress = progressData.reduce(
		(sum, item) => sum + item.realisasi * item.bobot,
		0
	);

	const openEditModal = (index) => {
		setSelectedIndex(index);
		const currentPercent = (progressData[index].realisasi * 100).toFixed(0);
		setInputValue(currentPercent);
		setModalVisible(true);
	};

	const handleSave = () => {
		const num = parseFloat(inputValue);
		if (isNaN(num) || num < 0 || num > 100) {
			Alert.alert("Error", "Masukkan nilai antara 0 - 100");
			return;
		}

		const updated = [...progressData];
		updated[selectedIndex].realisasi = num / 100;
		setProgressData(updated);
		setModalVisible(false);
		setSelectedIndex(null);
	};

	/** 🖼️ Upload gambar dari gallery (non-expo) */
	const handleUploadImage = async () => {
		const result = await launchImageLibrary({
			mediaType: "photo",
			selectionLimit: 0,
			quality: 0.8,
		});

		if (result.didCancel) return;

		const images = result.assets.map((asset) => ({
			uri: asset.uri,
			name: asset.fileName,
			type: asset.type,
		}));

		setLampiran([...lampiran, ...images]);
	};

	const handleRemoveImage = (index) => {
		const updated = lampiran.filter((_, i) => i !== index);
		setLampiran(updated);
	};

	const handleSubmit = () => {
		const payload = {
			progressData,
			lampiran,
		};
		console.log("📤 Data dikirim:", payload);
		Alert.alert("Sukses", "Data berhasil disimpan (cek console.log)");
	};

	return (
		<ScrollView
			style={styles.container}
			contentContainerStyle={{ paddingBottom: 40 }}
			showsVerticalScrollIndicator={false}
		>
		<Text style={styles.header}>PROGRES (mengacu Permen PUPR)</Text>
		<Text style={styles.subHeader}>Total Progress</Text>

		<Progress.Bar
			progress={totalProgress}
			width={null}
			color="#2761a9"
			unfilledColor="#e5e5e5"
			borderWidth={0}
			height={10}
			style={{ marginBottom: 16 }}
		/>
		<Text style={styles.totalText}>{(totalProgress * 100).toFixed(1)}%</Text>

		{progressData.map((item, index) => (
			<TouchableOpacity key={index} onPress={() => openEditModal(index)}>
			<View style={styles.card}>
				<Text style={styles.title}>{item.title}</Text>

				<Progress.Bar
					progress={item.realisasi}
					width={null}
					color="#2761a9"
					unfilledColor="#e5e5e5"
					borderWidth={0}
					height={8}
				/>

				<View style={styles.infoRow}>
				<Text style={styles.infoText}>
					<Text style={styles.bold}>Realisasi</Text> :{" "}
					{(item.realisasi * 100).toFixed(0)}%
				</Text>
				<Text style={styles.infoText}>
					<Text style={styles.bold}>Bobot</Text> :{" "}
					{(item.bobot * 100).toFixed(0)}%
				</Text>
				</View>
			</View>
			</TouchableOpacity>
		))}

		<Text style={styles.footerText}>
			Dokumentasi Pekerjaan Konstruksi Pembangunan Unit Pelayanan Makanan
			Bergizi Mandiri
		</Text>

		{/* === Lampiran Gambar === */}
		<TouchableOpacity style={styles.button} onPress={handleUploadImage}>
			<Text style={styles.buttonText}>Lampiran Gambar</Text>
		</TouchableOpacity>

		<View style={styles.imageContainer}>
			{lampiran.map((img, index) => (
			<View key={index} style={styles.imageWrapper}>
				<Image source={{ uri: img.uri }} style={styles.imagePreview} />
				<TouchableOpacity
					style={styles.removeButton}
					onPress={() => handleRemoveImage(index)}
				>
				<Text style={styles.removeButtonText}>×</Text>
				</TouchableOpacity>
			</View>
			))}
		</View>

			<View style={styles.navButtons}>
				<TouchableOpacity
					style={[styles.navButton, { backgroundColor: "#6c757d" }]}
					onPress={() => navigation.navigate("ConstructionReport")}
				>
				<Text style={styles.navButtonText}>Kembali</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={[styles.navButton, { backgroundColor: "#0068A7" }]}
					onPress={() => navigation.navigate("GeneralInformationForm")}
				>
				<Text style={styles.navButtonText}>Next</Text>
				</TouchableOpacity>
			</View>

		{/* Modal Edit Progress */}
		<Modal
			animationType="slide"
			transparent
			visible={modalVisible}
			onRequestClose={() => setModalVisible(false)}
		>
			<View style={styles.modalOverlay}>
			<View style={styles.modalBox}>
				<Text style={styles.modalTitle}>Edit Realisasi</Text>
				<Text style={styles.modalSubtitle}>
				{selectedIndex !== null && progressData[selectedIndex].title}
				</Text>

				<TextInput
					style={styles.input}
					value={inputValue}
					onChangeText={setInputValue}
					keyboardType="numeric"
					placeholder="Masukkan persentase (0 - 100)"
				/>

				<View style={styles.modalActions}>
				<TouchableOpacity
					style={[styles.modalButton, { backgroundColor: "#6c757d" }]}
					onPress={() => setModalVisible(false)}
				>
					<Text style={styles.modalButtonText}>Batal</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={[styles.modalButton, { backgroundColor: "#2761a9" }]}
					onPress={handleSave}
				>
					<Text style={styles.modalButtonText}>Simpan</Text>
				</TouchableOpacity>
				</View>
			</View>
			</View>
		</Modal>
		</ScrollView>
	);
};

export default ProgressForm;

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: "#fff", padding: 16 },
	header: { fontSize: 20, fontWeight: "bold", color: "#122E5F", marginBottom: 4 },
	subHeader: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 6 },
	totalText: { fontSize: 14, fontWeight: "bold", color: "#2761a9", marginBottom: 16 },
	card: {
		backgroundColor: "#f9f9f9",
		borderRadius: 8,
		padding: 12,
		marginBottom: 12,
		elevation: 2,
	},
	title: { fontSize: 13, fontWeight: "600", marginBottom: 8, color: "#122E5F" },
	infoRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 6 },
	infoText: { fontSize: 12, color: "#666" },
	bold: { fontWeight: "bold", color: "#d17bff" },
	footerText: { fontSize: 12, color: "#333", marginVertical: 16, textAlign: "center" },
	button: {
		backgroundColor: "#0068A7",
		paddingVertical: 12,
		borderRadius: 8,
		alignItems: "center",
		marginBottom: 10,
	},
	buttonText: { color: "#fff", fontWeight: "600" },
	imageContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 10,
		marginBottom: 20,
	},
	imageWrapper: { position: "relative" },
	imagePreview: { width: 100, height: 100, borderRadius: 8 },
	removeButton: {
		position: "absolute",
		top: -8,
		right: -8,
		backgroundColor: "rgba(0,0,0,0.6)",
		borderRadius: 12,
		width: 24,
		height: 24,
		alignItems: "center",
		justifyContent: "center",
	},
	removeButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
	saveButton: {
		backgroundColor: "#16A34A",
		paddingVertical: 14,
		borderRadius: 8,
		alignItems: "center",
	},
	saveButtonText: { color: "#fff", fontWeight: "600", fontSize: 15 },
	modalOverlay: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0,0,0,0.4)",
	},
	modalBox: {
		backgroundColor: "#fff",
		width: "85%",
		borderRadius: 10,
		padding: 20,
		elevation: 4,
	},
	modalTitle: { fontSize: 18, fontWeight: "bold", color: "#122E5F", marginBottom: 8 },
	modalSubtitle: { fontSize: 13, color: "#555", marginBottom: 12 },
	input: {
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 8,
		padding: 10,
		fontSize: 14,
		marginBottom: 16,
	},
	modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10 },
	modalButton: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
	modalButtonText: { color: "#fff", fontWeight: "600" },
	button: { backgroundColor: "#0068A7", paddingVertical: 12, borderRadius: 8, alignItems: "center", marginBottom: 20, }, buttonText: { color: "#fff", fontWeight: "600" }, navButtons: { flexDirection: "row", justifyContent: "space-between", gap: 10 }, navButton: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: "center" }, navButtonText: { color: "#fff", fontWeight: "600" },
});
