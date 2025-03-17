import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity 
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const RatingModal = ({ 
  visible, 
  onClose, 
	onSave,
  initialRating = 0 
}) => {
  // Armazena a nota selecionada
  const [rating, setRating] = useState(initialRating);

  // Atualiza o rating quando o initialRating muda
  useEffect(() => {
    setRating(Math.round(initialRating));
  }, [initialRating]);

  // Função para confirmar a nota
  const handleConfirm = () => {
		onSave(rating);
		onClose();
	};

  // Renderiza as 5 estrelas
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => setRating(i)}
          style={styles.starButton}
        >
          <Feather
            name="star"
            size={36}
            color={rating >= i ? "#FFD700" : "#263238"}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Que nota você dá para este momento?</Text>
          
					{/* seção de estrelas */}
          <View style={styles.starsContainer}>
            {renderStars()}
          </View>
        
          {/* Botões de cancelar e confirmar */}
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.confirmButton,
                rating === 0 && styles.disabledButton
              ]}
              onPress={rating > 0 ? handleConfirm : null}
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
    width: '90%',
    backgroundColor: 'rgba(3, 31, 43, 0.95)',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#5EDFFF',
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
    marginBottom: 10,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  starButton: {
    padding: 8,
  },
  selectedRating: {
    color: '#5EDFFF',
    fontSize: 18,
    fontFamily: 'Poppins-Medium',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#5EDFFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#5EDFFF',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  confirmButton: {
    backgroundColor: '#5EDFFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#031F2B',
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
  },
  disabledButton: {
    backgroundColor: '#5EDFFF80', 
  },
});

export default RatingModal;