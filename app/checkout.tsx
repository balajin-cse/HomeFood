Here's the fixed version with the missing closing brackets and parentheses. The main issues were in the `handlePlaceOrder` function where some brackets were missing. Here's the corrected code:

[Previous code remains the same until the handlePlaceOrder function]

```javascript
// Inside handlePlaceOrder function, after the cookOrder mapping:
            id: item.foodId,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            cookId: item.cookId,
            cookName: item.cookName,
          })),
          total: cookOrder.total,
          status: 'pending',
          deliveryAddress: selectedAddressData?.address,
          deliveryTime: selectedTimeData?.time,
          paymentMethod: selectedPayment,
          userId: user.id,
          createdAt: new Date().toISOString()
        };

        // Create the order
        const order = await createOrder(orderData);

        // Update cook earnings
        await updateCookEarnings(cookOrder.cookId, cookOrder.cookName, cookOrder.total);

        return order;
      });

      // Wait for all orders to be created
      await Promise.all(orderPromises);

      // Clear cart and show success animation
      clearCart();
      setShowSuccessAnimation(true);

    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert(
        'Error',
        'Failed to place order. Please try again.',
        [{ text: 'OK' }]
      );
      setIsPlacingOrder(false);
    }
  };

```

The rest of the code remains unchanged. The main fixes were:
1. Adding missing closing brackets for the order items mapping
2. Adding missing closing brackets for the handlePlaceOrder function
3. Ensuring proper closure of all objects and function calls