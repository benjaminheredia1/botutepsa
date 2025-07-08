'use client';

import { useState, useEffect, useCallback } from 'react';
import { useConversation } from '@elevenlabs/react';
import { motion, AnimatePresence } from 'framer-motion';
// He añadido más íconos para las opciones de llamada
import { MdCall, MdCallEnd, MdAccountCircle, MdMicOff, MdDialpad, MdVolumeUp } from 'react-icons/md';

export function PhoneCall() {
  const { status, isSpeaking, startSession, endSession } = useConversation({
    onConnect: () => console.log('Connected'),
    onDisconnect: () => console.log('Disconnected'),
    onMessage: (message) => console.log('Message:', message),
    onError: (error) => console.error('Error:', error),
  });

  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (status === 'connected') {
      const intervalId = setInterval(() => setTimer((t) => t + 1), 1000);
      return () => clearInterval(intervalId);
    } else {
      setTimer(0);
    }
  }, [status]);

  const startCall = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await startSession({ agentId: 'agent_01jzn7tt65egxadgvevx7agqqj' }); // ¡Reemplaza con tu Agent ID!
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  }, [startSession]);

  const endCall = useCallback(async () => await endSession(), [endSession]);

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const getStatusText = () => {
    if (status === 'connected') return formatTime(timer);
    if (status === 'connecting') return 'conectando...';
    if (status === 'disconnected') return 'Llamada finalizada';
    return 'Asistente UTEPSA'; // Texto inicial antes de llamar
  };

  // Opciones de llamada que aparecen durante la llamada (son decorativas)
  const callOptions = [
    { icon: MdMicOff, label: 'silenciar' },
    { icon: MdDialpad, label: 'teclado' },
    { icon: MdVolumeUp, label: 'altavoz' },
  ];

  // Variantes de animación para la lista de opciones (para que aparezcan una tras otra)
  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1, // Aplica un retraso de 0.1s entre cada hijo
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    // Contenedor principal: más alto y estrecho, como un teléfono real
    <motion.div
      className="w-full max-w-xs mx-auto text-white rounded-[40px] shadow-2xl overflow-hidden border-8 border-gray-800 bg-gray-900"
    >
      <div className="p-6 flex flex-col justify-between h-[640px]">
        {/* === SECCIÓN SUPERIOR: INFO DE CONTACTO === */}
        <motion.div 
          className="flex flex-col items-center pt-12 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.5 } }}
        >
          <motion.div
            className="p-1 rounded-full"
            animate={{ boxShadow: isSpeaking ? '0 0 25px rgba(34, 197, 94, 0.8)' : '0 0 0px rgba(34, 197, 94, 0)' }}
            transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
          >
            <MdAccountCircle className="text-9xl text-gray-400" />
          </motion.div>
          <h2 className="text-4xl font-semibold mt-4">
            {status !== 'idle' && status !== 'disconnected' ? 'Asistente Utepsa' : ''}
          </h2>
          <p className="text-lg text-gray-400 h-6 mt-1">{getStatusText()}</p>
        </motion.div>

        {/* === SECCIÓN INFERIOR: BOTONES DE CONTROL === */}
        <div className="flex flex-col items-center w-full">
          <AnimatePresence>
            {status === 'connected' && (
              // Contenedor para las opciones de llamada (mute, teclado, etc.)
              <motion.div
                key="call-options"
                variants={listVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="grid grid-cols-3 gap-x-8 mb-12"
              >
                {callOptions.map((option) => (
                  <motion.div key={option.label} variants={itemVariants} className="flex flex-col items-center">
                    <button className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                      <option.icon size={28} />
                    </button>
                    <span className="mt-2 text-sm capitalize">{option.label}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Botones principales de Iniciar/Finalizar llamada */}
          <AnimatePresence mode="wait">
            {status !== 'connected' ? (
       <motion.button
       key="call"
       onClick={startCall}
       disabled={status === 'connecting'}
       initial={{ scale: 0, opacity: 0 }}
       // MODIFICADO: Añadimos la animación de movimiento lateral
       animate={{ 
         scale: 1, 
         opacity: 1,
         translateX: ["0%", "10%", "-10%", "10%", "0%"], // Se mueve a la derecha, izquierda y vuelve al centro
       }}
       exit={{ scale: 0, opacity: 0 }}
       // NUEVO: Definimos una transición en bucle solo para el movimiento
       transition={{
         // Transición para la animación de movimiento lateral
         translateX: {
           duration: 1.5,       // Duración de un ciclo de movimiento
           repeat: Infinity,    // Repetir infinitamente
           repeatType: "loop",  // Tipo de repetición
           ease: "easeInOut",   // Curva de aceleración suave
           repeatDelay: 2,      // Espera 2 segundos antes de repetir
         },
         // Transición para las otras propiedades (scale, opacity)
         default: { 
           duration: 0.2 
         }
       }}
       className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg disabled:bg-gray-500"
     >
       <MdCall size={32} />
     </motion.button>
            ) : (
              <motion.button
                key="end"
                onClick={endCall}
                initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg"
              >
                <MdCallEnd size={32} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}