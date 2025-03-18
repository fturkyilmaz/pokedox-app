import { NavigationContainer } from "@react-navigation/native";
import Tabs from "./navigation/tab";
import { FavoritesProvider } from "./components/FavoritesProvider";
import { GestureHandlerRootView } from "react-native-gesture-handler";


const App = () => {
  return (
    <FavoritesProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
    <NavigationContainer >
      <Tabs />
    </NavigationContainer>
    </GestureHandlerRootView>
    </FavoritesProvider>
  );
}

export default App;