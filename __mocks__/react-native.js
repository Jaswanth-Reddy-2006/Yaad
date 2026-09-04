module.exports = {
  Platform: {
    OS: 'ios',
    select: (objs) => objs.ios || objs.default,
  },
  StyleSheet: {
    create: (styles) => styles,
    absoluteFill: {},
  },
  View: 'View',
  TouchableOpacity: 'TouchableOpacity',
  Text: 'Text',
};
