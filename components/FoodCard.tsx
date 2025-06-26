import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Star, MapPin, Clock } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { theme } from '@/constants/theme';

interface FoodItem {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  cookName: string;
  cookRating: number;
  distance: number;
  prepTime: number;
  tags: string[];
}

interface FoodCardProps {
  item: FoodItem;
  onPress: () => void;
}

export function FoodCard({ item, onPress }: FoodCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <Card style={styles.card}>
        <Image source={{ uri: item.image }} style={styles.image} />
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.price}>${item.price.toFixed(2)}</Text>
          </View>
          
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
          
          <View style={styles.cookInfo}>
            <Text style={styles.cookName}>by {item.cookName}</Text>
            <View style={styles.rating}>
              <Star size={14} color={theme.colors.secondary} fill={theme.colors.secondary} />
              <Text style={styles.ratingText}>{item.cookRating}</Text>
            </View>
          </View>
          
          <View style={styles.meta}>
            <View style={styles.metaItem}>
              <MapPin size={14} color={theme.colors.onSurfaceVariant} />
              <Text style={styles.metaText}>{item.distance}km</Text>
            </View>
            <View style={styles.metaItem}>
              <Clock size={14} color={theme.colors.onSurfaceVariant} />
              <Text style={styles.metaText}>{item.prepTime}min</Text>
            </View>
          </View>
          
          <View style={styles.tags}>
            {item.tags.slice(0, 3).map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 0,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  content: {
    padding: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: theme.colors.onSurface,
    marginRight: theme.spacing.md,
  },
  price: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: theme.colors.primary,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  cookInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  cookName: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.primary,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  ratingText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: theme.colors.onSurface,
  },
  meta: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  metaText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: theme.colors.onSurfaceVariant,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  tag: {
    backgroundColor: theme.colors.surfaceVariant,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  tagText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: theme.colors.onSurfaceVariant,
  },
});