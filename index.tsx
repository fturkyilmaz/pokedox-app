import './gesture-handler';
import "./src/i18n";
import '@expo/metro-runtime'; // Necessary for Fast Refresh on Web
import { registerRootComponent } from 'expo';
import App from './src/App';

registerRootComponent(App);
