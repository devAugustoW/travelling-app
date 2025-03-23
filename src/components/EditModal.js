import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet } from 'react-native';

const EditModal = ({ visible, onClose, onSave, value, setValue, title }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TextInput
            style={styles.modalInput}
            value={value}
            onChangeText={setValue}
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={onSave}
            >
              <Text style={styles.confirmButtonText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#031F2B',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
    marginBottom: 10,
  },
  modalInput: {
    width: '100%',
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    borderBottomWidth: 1,
    borderBottomColor: '#5EDFFF',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    padding: 10,
    backgroundColor: '#263238',
    borderRadius: 8,
    marginRight: 5,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#5EDFFF',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
  confirmButton: {
    flex: 1,
    padding: 10,
    backgroundColor: '#5EDFFF',
    borderRadius: 8,
    marginLeft: 5,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#031F2B',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
});

export default EditModal;