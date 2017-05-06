import React from 'react';
import ReactCrop from 'react-image-crop'

import { storiesOf, action } from '@kadira/storybook';
import LoadAvatar from './../components/LoadAvatar.jsx'
import imageFile from '../avatar100.png';

const style1 = {
    background: '#32CD32',
    fontSize: '20px'
}

const style2 = {
    color: '#32CD32',
}

const style3 = {
    background: '#32CD32',
    fontSize: '20px'
}


storiesOf('Load Avatar', module)
  .add("Вертикальное расположение", () => (
    <LoadAvatar 
        image={imageFile} 
        href={imageFile}
        sizeBytes={2000000}
        inline={false}
    />
  ))
  .add("Горизонтальное расположение", () => (
    <LoadAvatar 
        image={imageFile} 
        sizeBytes={2000000}
        inline={true}
    />
  ))
  .add("Кастомные стили", () => (
    <LoadAvatar 
        image={imageFile} 
        loadButtonText={"Загрузить Аву"}
        loadButtonStyle={style1} 
        headerStyle={style2} 
        saveButtonStyle={style3} 
        saveButtonText={"Готово!"}
        sizeBytes={2000000}
        loadHeader={"Выделение области"}
        inline={true}
    />
  ))
