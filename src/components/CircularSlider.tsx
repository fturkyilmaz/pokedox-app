import { View, Image, Dimensions, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { FlatList, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { interpolate, SharedValue, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, runOnJS } from 'react-native-reanimated';

const images = [
    require("../../assets/icon/ashIcon.jpg"),
    require("../../assets/icon/brockIcon.jpg"),
    require("../../assets/icon/garyIcon.jpg"),
    require("../../assets/icon/mistyIcon.png"),
    require("../../assets/icon/roketBack.png"),
    require("../../assets/icon/profIcon.jpg"),
];

const back = [
    require("../../assets/ashBack.jpg"),
    require("../../assets/brockBack.jpg"),
    require("../../assets/garyoakBack.jpg"),
    require("../../assets/misty.png"),
    require("../../assets/roket.jpg"),
    require("../../assets/oakBack.jpg"),
];

const { width, height } = Dimensions.get('screen');
const _itemSize = width * 0.24;
const _spacing = 12;
const _itemTotalSize = _itemSize + _spacing;

function CoruselItem({ imageUri, index, scrollX }: { imageUri: any; index: number; scrollX: SharedValue<number> }) {
    const stylez = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateY: interpolate(
                        scrollX.value,
                        [index + 1, index, index - 1], // inputRange
                        [_itemSize / 4, 0, _itemSize / 4] // outputRange
                    )
                }
            ]
        };
    });

    return (
        <Animated.View style={[stylez]}>
            <Image
                source={imageUri}
                style={{
                    width: _itemSize,
                    height: _itemSize,
                    borderRadius: _itemSize / 2,
                    borderWidth: 4, // Border'ı buraya taşıyoruz
                    borderColor: 'black', // Sınır rengi ekliyoruz
                    overflow: 'hidden', // Aşırı büyümeyi önlüyoruz
                    resizeMode: 'cover',
                }}
            />
        </Animated.View>
    );
}

export default function CircularSlider() {
    const scrollX = useSharedValue(0);
    const [backgroundImage, setBackgroundImage] = useState(back[0]);

    const onScroll = useAnimatedScrollHandler(event => {
        let index = Math.round(event.contentOffset.x / _itemTotalSize);

        if (index < 0) index = 0;
        if (index >= back.length) index = back.length - 1;

        runOnJS(setBackgroundImage)(back[index]); // Reanimated içinde güvenli state güncellemesi
        scrollX.value = event.contentOffset.x / _itemTotalSize;
    });

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
                {/* Arka plan resmi */}
                <Image source={backgroundImage} style={styles.backgroundImage} />

                <Animated.FlatList
                    style={{ flexGrow: 1, paddingTop: _itemSize - 40 }} // flexGrow: 1 eklendi
                    contentContainerStyle={{
                        paddingHorizontal: (width - _itemSize) / 2,
                        gap: _spacing,
                        paddingBottom: 20, // Alt kısımdaki kesilmeleri önlemek için eklendi
                    }}
                    data={images}
                    keyExtractor={(_, index) => String(index)}
                    renderItem={({ item, index }) => (
                        <CoruselItem imageUri={item} index={index} scrollX={scrollX} />
                    )}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    onScroll={onScroll}
                    scrollEventThrottle={16}
                    snapToInterval={_itemTotalSize}
                
                />
            </View>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    backgroundImage: {
        position: 'absolute',
        width: width,
        height: height,
        resizeMode: 'cover',
    },
});