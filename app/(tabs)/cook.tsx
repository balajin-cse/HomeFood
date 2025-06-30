Here's the fixed version with all missing closing brackets added:

```javascript
// At the end of the CookProfileInterface function, add:
        )}
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => setShowAddForm(true)}
      />

      {/* Orders Modal */}
      <Modal
        visible={showOrdersModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowOrdersModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>All Orders</Text>
            <TouchableOpacity 
              onPress={() => setShowOrdersModal(false)}
              style={styles.modalCloseButton}
            >
              <X size={24} color={theme.colors.onSurface} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {cookOrders.length === 0 ? (
              <View style={styles.emptyOrders}>
                <Package size={48} color={theme.colors.onSurfaceVariant} />
                <Text style={styles.emptyOrdersTitle}>No Orders Yet</Text>
                <Text style={styles.emptyOrdersText}>
                  Orders from customers will appear here
                </Text>
              </View>
            ) : (
              cookOrders.map((order) => (
                <Card key={order.orderId} style={styles.orderCard}>
                  <View style={styles.orderCardContent}>
                    <View style={styles.orderCardHeader}>
                      <Text style={styles.orderCardTitle}>
                        {order.items[0]?.title || 'Order'} 
                        {order.items.length > 1 && ` +${order.items.length - 1} more`}
                      </Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                        <Text style={styles.statusText}>{getStatusText(order.status)}</Text>
                      </View>
                    </View>
                    
                    <Text style={styles.orderCardCustomer}>
                      Customer: {order.customerName}
                    </Text>
                    <Text style={styles.orderCardDetails}>
                      Order #{order.trackingNumber} • ${order.totalPrice.toFixed(2)}
                    </Text>
                    <Text style={styles.orderCardDate}>
                      {new Date(order.orderDate).toLocaleDateString()}
                    </Text>
                    
                    {['confirmed', 'preparing', 'ready'].includes(order.status) && (
                      <View style={styles.orderCardActions}>
                        {order.status === 'confirmed' && (
                          <Button
                            mode="contained"
                            onPress={() => handleUpdateOrderStatus(order.orderId, 'preparing')}
                            style={styles.orderActionButton}
                            compact
                          >
                            Start Preparing
                          </Button>
                        )}
                        {order.status === 'preparing' && (
                          <Button
                            mode="contained"
                            onPress={() => handleUpdateOrderStatus(order.orderId, 'ready')}
                            style={styles.orderActionButton}
                            compact
                          >
                            Mark Ready
                          </Button>
                        )}
                        {order.status === 'ready' && (
                          <Button
                            mode="contained"
                            onPress={() => handleUpdateOrderStatus(order.orderId, 'picked_up')}
                            style={styles.orderActionButton}
                            compact
                          >
                            Mark Picked Up
                          </Button>
                        )}
                      </View>
                    )}
                  </View>
                </Card>
              ))
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
```