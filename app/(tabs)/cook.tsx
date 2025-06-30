Here's the fixed version with all missing closing brackets added:

```javascript
// At the end of the file, add these closing brackets:
        )}
      </ScrollView>

      {/* Cook Profile Modal */}
      <Modal
        visible={showCookProfile}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCookProfile(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{selectedCook?.name}</Text>
            <TouchableOpacity 
              onPress={() => setShowCookProfile(false)}
              style={styles.modalCloseButton}
            >
              <X size={24} color={theme.colors.onSurface} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedCook && (
              <Button
                mode="contained"
                onPress={() => handleViewCookMenu(selectedCook.id)}
              >
                View Menu
              </Button>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
```