import React from 'react';
import { Modal, View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet, type TextInputProps } from 'react-native';
import { tokens } from '../theme/tokens';

export function Button({children,onPress,disabled=false,secondary=false,danger=false,label}:{children:React.ReactNode;onPress:()=>void;disabled?:boolean;secondary?:boolean;danger?:boolean;label?:string}) {
  return <TouchableOpacity accessibilityRole="button" accessibilityLabel={label} accessibilityState={{disabled}} disabled={disabled} onPress={onPress} style={[ui.button,secondary&&ui.secondary,danger&&ui.danger,disabled&&{opacity:.45}]}><Text style={[ui.buttonText,secondary&&{color:tokens.colors.textPrimary}]}>{children}</Text></TouchableOpacity>;
}
export function Field({label,...props}:TextInputProps & {label:string}) {
  return <View style={ui.field}><Text style={ui.label}>{label}</Text><TextInput accessibilityLabel={label} placeholderTextColor={tokens.colors.textTertiary} {...props} style={[ui.input,props.style]} /></View>;
}
export function Choices({label,value,options,onChange}:{label:string;value:string;options:{value:string;label:string}[];onChange:(value:string)=>void}) {
  return <View style={ui.field}><Text style={ui.label}>{label}</Text><View style={ui.wrap}>{options.map(option=><TouchableOpacity key={option.value} accessibilityRole="button" accessibilityLabel={`${label}: ${option.label}`} accessibilityState={{selected:value===option.value}} onPress={()=>onChange(option.value)} style={[ui.choice,value===option.value&&ui.selected]}><Text style={[ui.choiceText,value===option.value&&{color:tokens.colors.brand,fontWeight:'600'}]}>{option.label}</Text></TouchableOpacity>)}</View></View>;
}
export function ErrorText({error}:{error:string}) { return error ? <Text accessibilityRole="alert" style={ui.error}>{error}</Text> : null; }
export function Sheet({visible,title,onClose,children}:{visible:boolean;title:string;onClose:()=>void;children:React.ReactNode}) {
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}><View style={ui.overlay}><View style={ui.sheet} accessibilityViewIsModal><View style={ui.heading}><Text accessibilityRole="header" style={ui.title}>{title}</Text><Button secondary onPress={onClose} label={`Cerrar ${title}`}>Cerrar</Button></View><ScrollView contentContainerStyle={ui.body} keyboardShouldPersistTaps="handled">{children}</ScrollView></View></View></Modal>;
}
export const ui=StyleSheet.create({
  overlay:{flex:1,backgroundColor:'rgba(29,29,31,.24)',justifyContent:'center',alignItems:'center',padding:16},
  sheet:{width:'100%',maxWidth:640,maxHeight:'92%',backgroundColor:tokens.colors.surface,borderRadius:18,overflow:'hidden'},
  heading:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:12,padding:20,borderBottomWidth:1,borderColor:tokens.colors.borderSubtle},
  title:{fontSize:20,fontWeight:'600',color:tokens.colors.textPrimary,flexShrink:1},
  body:{padding:20,gap:18},field:{gap:8},label:{fontSize:13,fontWeight:'600',color:tokens.colors.textPrimary},
  input:{backgroundColor:tokens.colors.surfaceSecondary,borderWidth:1,borderColor:tokens.colors.borderDefault,borderRadius:10,padding:12,fontSize:14,color:tokens.colors.textPrimary,minHeight:44},
  wrap:{flexDirection:'row',flexWrap:'wrap',gap:8},choice:{paddingHorizontal:12,paddingVertical:10,borderWidth:1,borderColor:tokens.colors.borderDefault,borderRadius:9,maxWidth:'100%'},
  selected:{backgroundColor:tokens.colors.brandLight,borderColor:tokens.colors.borderActive},choiceText:{fontSize:13,color:tokens.colors.textSecondary,flexShrink:1},
  button:{backgroundColor:tokens.colors.brand,borderRadius:10,paddingVertical:12,paddingHorizontal:16,alignItems:'center',justifyContent:'center',minHeight:44},
  secondary:{backgroundColor:tokens.colors.surfaceTertiary},danger:{backgroundColor:tokens.colors.danger},buttonText:{color:'#FFF',fontSize:14,fontWeight:'600',textAlign:'center'},
  error:{color:'#B42318',backgroundColor:'#FFF1F0',borderRadius:8,padding:12,fontSize:14,lineHeight:20},
  muted:{fontSize:13,color:tokens.colors.textSecondary,lineHeight:20},row:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap'},
  card:{backgroundColor:tokens.colors.surface,borderRadius:16,padding:20,gap:16,borderWidth:1,borderColor:tokens.colors.borderSubtle},
});
