import { Box, Text, TextField, Image, Button } from '@skynexui/components';
import { createClient } from '@supabase/supabase-js';
import React from 'react';
import appConfig from '../config.json';
import { useRouter } from 'next/router'
import { ButtonSendSticker } from '../src/components/ButtonSendSticker'

const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MzQ3NjQxMSwiZXhwIjoxOTU5MDUyNDExfQ.ty2U31Lc9XzDUtBsrFxmFHJYOVFrm3DaWZRZwJHwH_o'
const SUPABASE_URL = 'https://tvwdlouxasjlyhhymsvo.supabase.co'
const supaBaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Código sem a lib
// fetch(`${SUPABASE_URL}/rest/v1/message?select=*`, {
//     headers: {
//         'Content-type': 'application/json',
//         'apikey': SUPABASE_ANON_KEY,
//         'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
//     }
// })
//     .then((res) => {
//         return res.json()
//     })
//     .then((res) => {
//         console.log(response)
//     })

function escutaMensagensEmTempoReal(adicionaMensagem) {
    return supaBaseClient
        .from('mensagens')
        .on('INSERT', (respostaLive) => {
            adicionaMensagem(respostaLive.new)
        })
        .subscribe()
}

export default function ChatPage() {
    const roteamento = useRouter()
    const usuarioLogado = roteamento.query.username
    const [mensagem, setMensagem] = React.useState('')
    const [listaDeMensagens, setListaDeMensagens] = React.useState([])

    // tudo que nao faz parte do fluxograma padrão do React
    // roda sempre quando a página carrega
    // mas se o state/lista de mensagens mudarem, eu observo as
    React.useEffect(() => {
        // aqui passamos a tabela qual queremos buscar
        supaBaseClient
            .from('mensagens')
            .select('*')
            .order('id', { ascending: false })
            .then(({data}) => {
                setListaDeMensagens(data)
            })

            escutaMensagensEmTempoReal((novaMensagem) => {
                //console.log('Nova mensagem', novaMensagem)
                setListaDeMensagens((valorAtualDaLista) => {
                    return [
                        novaMensagem,
                        ...valorAtualDaLista,
                    ]
                })
            })
    }, [])

    function handleNovaMensagem(novaMensagem) {
        const mensagem = { // a mensagem é um objeto
            // id: listaDeMensagens.length + 1,
            de: usuarioLogado,
            texto: novaMensagem,
        }

        supaBaseClient
            .from('mensagens')
            .insert([
                mensagem
            ])
            .then(({}) => {
                //console.log('Criando mensagem: ', data)
                // setListaDeMensagens([
                //     data[0],
                //     ...listaDeMensagens,
                // ])
            })

        setMensagem('')
    }

    // ./Sua lógica vai aqui
    return (
        <Box
            styleSheet={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundImage: `url(https://th.bing.com/th/id/R.f38e413a04321ed0f6b848568ddc2650?rik=FpB5T3Ifu5AluA&pid=ImgRaw&r=0)`,
                backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundBlendMode: 'multiply',
                color: appConfig.theme.colors.neutrals['000']
            }}
        >
            <Box
                styleSheet={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    boxShadow: '0 2px 10px 0 rgb(0 0 0 / 20%)',
                    borderRadius: '5px',
                    backgroundColor: appConfig.theme.colors.neutrals[700],
                    height: '100%',
                    maxWidth: '95%',
                    maxHeight: '95vh',
                    padding: '32px',
                    opacity: 0.9
                }}
            >
                <Header />
                <Box
                    styleSheet={{
                        position: 'relative',
                        display: 'flex',
                        flex: 1,
                        height: '80%',
                        backgroundColor: appConfig.theme.colors.neutrals[600],
                        flexDirection: 'column',
                        borderRadius: '5px',
                        padding: '16px',
                    }}
                >

                    <MessageList mensagens={listaDeMensagens} />

                    <Box
                        as="form"
                        styleSheet={{
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >

                        <TextField
                            value={mensagem}
                            onChange={(event) => {
                                const valor = event.target.value
                                setMensagem(valor)
                            }}
                            onKeyPress={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault()

                                    handleNovaMensagem(mensagem)
                                }
                            }}
                            placeholder="Insira sua mensagem aqui..."
                            type="textarea"
                            styleSheet={{
                                width: '100%',
                                border: '0',
                                resize: 'none',
                                borderRadius: '5px',
                                padding: '6px 8px',
                                backgroundColor: appConfig.theme.colors.neutrals[800],
                                marginRight: '12px',
                                color: appConfig.theme.colors.neutrals[200],
                            }}
                        />
                        { /* Callback? chamada de retorno, quando alguma coisa queria terminou, executa a função que foi chamada */ }
                        <ButtonSendSticker
                            onStickerClick={(sticker) => {
                                // console.log('USANDO O COMPONENTE: Salva este ticker no banco', sticker)
                                handleNovaMensagem(':sticker: ' + sticker)
                            }}    />
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

function Header() {
    return (
        <>
            <Box styleSheet={{ width: '100%', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} >
                <Text variant='heading5'>
                    Chat
                </Text>
                <Button
                    colorVariant='neutral'
                    label='Logout'
                    href="/"
                    buttonColors={{
                        contrastColor: appConfig.theme.colors.neutrals["000"],
                        mainColor: appConfig.theme.colors.primary["1000"],
                        mainColorLight: appConfig.theme.colors.primary["2000"],
                        mainColorStrong: appConfig.theme.colors.primary["2000"],
                    }}
                />
            </Box>
        </>
    )
}

function MessageList(props) {
    // console.log(props.listaDeMensagens);
    return (
        <Box
            tag="ul"
            styleSheet={{
                overflow: 'scroll',
                display: 'flex',
                flexDirection: 'column-reverse',
                flex: 1,
                color: appConfig.theme.colors.neutrals["000"],
                marginBottom: '16px',
            }}
        >

            {props.mensagens.map((mensagem) => {
                return (
                    <Text
                    key={mensagem.id}
                    tag="li"
                    styleSheet={{
                        borderRadius: '5px',
                        padding: '6px',
                        marginBottom: '12px',
                        hover: {
                            backgroundColor: appConfig.theme.colors.neutrals[700],
                        }
                    }}
                >
                    <Box
                        styleSheet={{
                            marginBottom: '8px',
                        }}
                    >
                        <Image
                            styleSheet={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                display: 'inline-block',
                                marginRight: '8px',
                            }}
                            src={`https://github.com/${mensagem.de}.png`}
                        />
                        <Text tag="strong">
                            {mensagem.de}
                        </Text>
                        <Text
                            styleSheet={{
                                fontSize: '10px',
                                marginLeft: '8px',
                                color: appConfig.theme.colors.neutrals[300],
                            }}
                            tag="span"
                        >
                            {(new Date().toLocaleDateString())}
                        </Text>
                    </Box>
                    { /* Declarações */}
                    { /* mensagem.texto.startsWith(':sticker').toString() */}
                    {mensagem.texto.startsWith(':sticker') ? (
                        <Image styleSheet={{maxWidth: '150px'}} src={mensagem.texto.replace(':sticker:', '')} />
                    )
                    : (
                        mensagem.texto
                    )}
                </Text>
                )
            })}
        </Box>
    )
}