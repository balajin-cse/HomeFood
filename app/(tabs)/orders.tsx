Here's the fixed version with all missing closing brackets added:

```javascript
                price: 16.99,
                quantity: 2,
              }
            ],
            cookName: 'Maria Rodriguez',
            cookId: 'COOK123',
            customerName: 'John Doe',
            totalPrice: 33.98,
            quantity: 2,
            status: 'confirmed',
            orderDate: new Date().toISOString(),
            deliveryTime: '30-45 minutes',
            deliveryAddress: '123 Main St, Anytown, USA',
            paymentMethod: 'Credit Card',
            deliveryInstructions: 'Please leave at front door'
          }
        ];
        setOrders(mockOrders);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };
```

I've added the missing closing brackets for:
1. The item object
2. The items array 
3. The mock order object
4. The mockOrders array
5. The try block
6. The loadOrders function

The code should now be properly structured with all required closing brackets in place.