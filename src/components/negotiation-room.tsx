"use client"

import { useEffect, useRef, useState, useTransition, useCallback } from "react"
import {
  sendMessage,
  sendProposal,
  respondToProposal,
  sendQuickAction,
} from "@/lib/actions"
import { useWebSocket } from "@/lib/use-websocket"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Send,
  FileText,
  Truck,
  Receipt,
  HandshakeIcon,
  ArrowLeft,
  Check,
  X,
  RotateCcw,
} from "lucide-react"
import { PRODUCTS, UNITS, DELIVERY_TYPES, PAYMENT_TERMS } from "@/lib/constants"
import Link from "next/link"

// ─── Types ──────────────────────────────────────────────────────────────────────

type MessageType = {
  id: string
  content: string | null
  type: string
  fileUrl: string | null
  fileName: string | null
  createdAt: string
  senderId: string
  sender: { id: string; name: string }
}

type ProposalType = {
  id: string
  product: string
  quantity: number
  unit: string
  price: number
  city: string
  state: string
  deliveryType: string
  deliveryDate: string | null
  paymentTerms: string
  observation: string | null
  status: string
  createdAt: string
  senderId: string
  sender: { id: string; name: string }
}

type Props = {
  negotiation: {
    id: string
    status: string
    offer: {
      id: string
      product: string
      quantity: number
      unit: string
      price: number | null
      city: string
      state: string
      deliveryType: string
    }
    user1: { id: string; name: string; company: string | null }
    user2: { id: string; name: string; company: string | null }
    contract: { id: string } | null
  }
  messages: MessageType[]
  proposals: ProposalType[]
  currentUserId: string
  currentUserName: string
  otherUser: { id: string; name: string; company: string | null }
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function formatTime(isoString: string) {
  const date = new Date(isoString)
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatDate(isoString: string) {
  const date = new Date(isoString)
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  })
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function getPaymentLabel(value: string) {
  const found = PAYMENT_TERMS.find((p) => p.value === value)
  return found ? found.label : value
}

function getStatusColor(status: string) {
  switch (status) {
    case "ABERTA":
      return "bg-green-100 text-green-800 border-green-200"
    case "FECHADA":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "CANCELADA":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return ""
  }
}

function getProposalStatusConfig(status: string) {
  switch (status) {
    case "PENDENTE":
      return {
        label: "Pendente",
        className: "bg-amber-100 text-amber-800 border-amber-200",
      }
    case "ACEITA":
      return {
        label: "Aceita",
        className: "bg-green-100 text-green-800 border-green-200",
      }
    case "RECUSADA":
      return {
        label: "Recusada",
        className: "bg-red-100 text-red-800 border-red-200",
      }
    case "CONTRA_PROPOSTA":
      return {
        label: "Contra-proposta",
        className: "bg-purple-100 text-purple-800 border-purple-200",
      }
    default:
      return { label: status, className: "" }
  }
}

function isSameDay(a: string, b: string) {
  const da = new Date(a)
  const db = new Date(b)
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  )
}

function formatDayLabel(isoString: string) {
  const date = new Date(isoString)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  if (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  ) {
    return "Hoje"
  }
  if (
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate()
  ) {
    return "Ontem"
  }
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

// ─── Component ──────────────────────────────────────────────────────────────────

export default function NegotiationRoom({
  negotiation,
  messages: initialMessages,
  proposals: initialProposals,
  currentUserId,
  currentUserName,
  otherUser,
}: Props) {
  const [messageText, setMessageText] = useState("")
  const [proposalDialogOpen, setProposalDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Real-time state
  const [messages, setMessages] = useState<MessageType[]>(initialMessages)
  const [proposals, setProposals] = useState<ProposalType[]>(initialProposals)
  const [negotiationStatus, setNegotiationStatus] = useState(negotiation.status)
  const [contractInfo, setContractInfo] = useState(negotiation.contract)
  const [typingUser, setTypingUser] = useState<string | null>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const proposalMap = new Map(proposals.map((p) => [p.id, p]))

  // WebSocket handler
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleWsMessage = useCallback((data: any) => {
    switch (data.type) {
      case "new_message": {
        const msg = data.message as MessageType
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev
          return [...prev, msg]
        })
        break
      }
      case "new_proposal": {
        const proposal = data.proposal as ProposalType
        const msg = data.message as MessageType
        setProposals((prev) => {
          if (prev.some((p) => p.id === proposal.id)) return prev
          return [...prev, proposal]
        })
        if (msg) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev
            return [...prev, msg]
          })
        }
        break
      }
      case "proposal_response": {
        const { proposalId, newStatus, message, negotiationStatus: newNegStatus, contract } = data as {
          proposalId: string
          newStatus: string
          message: MessageType
          negotiationStatus?: string
          contract?: { id: string }
        }
        setProposals((prev) =>
          prev.map((p) => (p.id === proposalId ? { ...p, status: newStatus } : p))
        )
        if (message) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === message.id)) return prev
            return [...prev, message]
          })
        }
        if (newNegStatus) setNegotiationStatus(newNegStatus)
        if (contract) setContractInfo(contract)
        break
      }
      case "typing": {
        const { userName } = data as { userName: string }
        setTypingUser(userName)
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
        typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 2000)
        break
      }
    }
  }, [])

  const { send: wsSend } = useWebSocket({
    negotiationId: negotiation.id,
    onMessage: handleWsMessage,
  })

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages.length])

  // Typing indicator throttle
  const lastTypingSentRef = useRef(0)
  function handleTyping() {
    const now = Date.now()
    if (now - lastTypingSentRef.current > 1500) {
      lastTypingSentRef.current = now
      wsSend({ type: "typing", userId: currentUserId, userName: currentUserName })
    }
  }

  // ── Handlers ────────────────────────────────────────────────────────────────

  function handleSendMessage(e: React.FormEvent) {
    e.preventDefault()
    const text = messageText.trim()
    if (!text) return

    const optimisticMsg: MessageType = {
      id: `optimistic-${Date.now()}`,
      content: text,
      type: "TEXT",
      fileUrl: null,
      fileName: null,
      createdAt: new Date().toISOString(),
      senderId: currentUserId,
      sender: { id: currentUserId, name: currentUserName },
    }
    setMessages((prev) => [...prev, optimisticMsg])
    setMessageText("")
    inputRef.current?.focus()

    startTransition(async () => {
      await sendMessage(negotiation.id, text)
      wsSend({
        type: "new_message",
        message: optimisticMsg,
      })
    })
  }

  function handleQuickAction(actionType: string) {
    startTransition(async () => {
      await sendQuickAction(negotiation.id, actionType)
    })
  }

  function handleRespondToProposal(
    proposalId: string,
    action: "ACEITA" | "RECUSADA" | "CONTRA_PROPOSTA"
  ) {
    startTransition(async () => {
      await respondToProposal(proposalId, action)

      setProposals((prev) =>
        prev.map((p) => (p.id === proposalId ? { ...p, status: action } : p))
      )

      wsSend({
        type: "proposal_response",
        proposalId,
        newStatus: action,
        message: null,
        negotiationStatus: action === "ACEITA" ? "FECHADA" : undefined,
      })

      if (action === "ACEITA") {
        setNegotiationStatus("FECHADA")
      }

      if (action === "CONTRA_PROPOSTA") {
        setProposalDialogOpen(true)
      }
    })
  }

  function handleSendProposal(formData: FormData) {
    startTransition(async () => {
      await sendProposal(negotiation.id, formData)
      setProposalDialogOpen(false)
    })
  }

  const isClosed = negotiationStatus !== "ABERTA"

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* ── Top Bar ───────────────────────────────────────────────────── */}
      <div className="border-b bg-card px-4 py-3">
        <div className="mx-auto flex max-w-4xl items-center gap-3">
          <Link
            href="/dashboard/negotiations"
            className="shrink-0 rounded-lg p-1.5 transition-colors hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-semibold text-foreground truncate">
                {otherUser.name}
              </h2>
              {otherUser.company && (
                <span className="hidden text-sm text-muted-foreground sm:inline">
                  &middot; {otherUser.company}
                </span>
              )}
              <Badge className={getStatusColor(negotiationStatus)}>
                {negotiationStatus}
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground truncate">
              {negotiation.offer.product} &middot;{" "}
              {negotiation.offer.quantity}{" "}
              {negotiation.offer.unit === "tonelada" ? "ton" : "sc"}
              {negotiation.offer.price && (
                <span>
                  {" "}
                  &middot; R$ {formatCurrency(negotiation.offer.price)}/
                  {negotiation.offer.unit === "tonelada" ? "ton" : "sc"}
                </span>
              )}
              {" "}&middot; {negotiation.offer.city} - {negotiation.offer.state}
            </p>
          </div>

          {contractInfo && (
            <Link href={`/contracts/${contractInfo.id}`}>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 gap-1.5 border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Contrato</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* ── Banners ───────────────────────────────────────────────────── */}
      {negotiationStatus === "FECHADA" && (
        <div className="border-b bg-blue-50 px-4 py-2.5">
          <div className="mx-auto flex max-w-4xl items-center justify-center gap-2 text-sm">
            <HandshakeIcon className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-800">Negócio fechado!</span>
            {contractInfo && (
              <Link
                href={`/contracts/${contractInfo.id}`}
                className="ml-1 font-semibold text-blue-600 underline underline-offset-2 hover:text-blue-800"
              >
                Ver contrato
              </Link>
            )}
          </div>
        </div>
      )}

      {negotiationStatus === "CANCELADA" && (
        <div className="border-b bg-red-50 px-4 py-2.5">
          <div className="mx-auto flex max-w-4xl items-center justify-center gap-2 text-sm">
            <X className="h-4 w-4 text-red-600" />
            <span className="font-medium text-red-800">Negociação cancelada.</span>
          </div>
        </div>
      )}

      {/* ── Chat Area ─────────────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        className="chat-scroll flex-1 overflow-y-auto bg-gradient-to-b from-green-50/40 to-background"
      >
        <div className="mx-auto max-w-4xl space-y-1 px-4 py-4">
          {messages.map((msg, index) => {
            const isOwn = msg.senderId === currentUserId
            const showDaySeparator =
              index === 0 ||
              !isSameDay(messages[index - 1].createdAt, msg.createdAt)

            const isProposalMessage =
              msg.content && msg.content.startsWith("PROPOSAL:")
            const proposalId = isProposalMessage
              ? msg.content!.replace("PROPOSAL:", "")
              : null
            const proposal = proposalId ? proposalMap.get(proposalId) : null

            return (
              <div key={msg.id}>
                {showDaySeparator && (
                  <div className="flex items-center justify-center py-3">
                    <span className="rounded-full bg-muted/80 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
                      {formatDayLabel(msg.createdAt)}
                    </span>
                  </div>
                )}

                {isProposalMessage && proposal ? (
                  <div className={`flex mb-3 ${isOwn ? "justify-end" : "justify-start"}`}>
                    <div className="w-full max-w-sm">
                      <ProposalCard
                        proposal={proposal}
                        isOwn={isOwn}
                        currentUserId={currentUserId}
                        onRespond={handleRespondToProposal}
                        isPending={isPending}
                      />
                    </div>
                  </div>
                ) : msg.type === "SYSTEM" ? (
                  <div className="flex justify-center py-1.5">
                    <span className="max-w-xs rounded-lg bg-muted/60 px-3 py-1.5 text-center text-xs text-muted-foreground shadow-sm sm:max-w-sm">
                      {msg.content}
                    </span>
                  </div>
                ) : (
                  <div className={`flex mb-1 ${isOwn ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`group relative max-w-[75%] rounded-2xl px-3.5 py-2 shadow-sm sm:max-w-[65%] ${
                        isOwn
                          ? "rounded-br-md bg-primary text-primary-foreground"
                          : "rounded-bl-md bg-card border border-border text-card-foreground"
                      }`}
                    >
                      {!isOwn && (
                        <p className="mb-0.5 text-xs font-semibold text-primary">
                          {msg.sender.name.split(" ")[0]}
                        </p>
                      )}
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {msg.content}
                      </p>
                      <p
                        className={`mt-1 text-right text-[10px] ${
                          isOwn ? "text-primary-foreground/60" : "text-muted-foreground"
                        }`}
                      >
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-3 rounded-full bg-green-100 p-3">
                <HandshakeIcon className="h-6 w-6 text-green-700" />
              </div>
              <p className="text-sm font-medium text-foreground">Início da negociação</p>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                Envie uma mensagem ou proposta para começar a negociar.
              </p>
            </div>
          )}

          {typingUser && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-md border border-border bg-card px-3.5 py-2 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:0ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:300ms]" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {typingUser} está digitando
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom Action Bar ─────────────────────────────────────────── */}
      {!isClosed && (
        <div className="border-t bg-card">
          <div className="mx-auto max-w-4xl border-b px-4 py-2">
            <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
              <Dialog open={proposalDialogOpen} onOpenChange={setProposalDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0 gap-1.5 border-primary/30 text-primary hover:bg-primary/5 hover:text-primary"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Enviar Proposta
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg">
                      <HandshakeIcon className="h-5 w-5 text-primary" />
                      Nova Proposta
                    </DialogTitle>
                  </DialogHeader>
                  <ProposalForm
                    offer={negotiation.offer}
                    onSubmit={handleSendProposal}
                    isPending={isPending}
                  />
                </DialogContent>
              </Dialog>

              <Separator orientation="vertical" className="h-6" />

              <Button variant="ghost" size="sm" className="shrink-0 gap-1.5 text-muted-foreground hover:text-foreground" onClick={() => handleQuickAction("solicitar_contrato")} disabled={isPending}>
                <FileText className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Solicitar</span> Contrato
              </Button>
              <Button variant="ghost" size="sm" className="shrink-0 gap-1.5 text-muted-foreground hover:text-foreground" onClick={() => handleQuickAction("solicitar_logistica")} disabled={isPending}>
                <Truck className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Dados</span> Logísticos
              </Button>
              <Button variant="ghost" size="sm" className="shrink-0 gap-1.5 text-muted-foreground hover:text-foreground" onClick={() => handleQuickAction("solicitar_nf")} disabled={isPending}>
                <Receipt className="h-3.5 w-3.5" />
                Nota Fiscal
              </Button>
            </div>
          </div>

          <form onSubmit={handleSendMessage} className="mx-auto flex max-w-4xl items-center gap-2 px-4 py-3">
            <Input
              ref={inputRef}
              value={messageText}
              onChange={(e) => {
                setMessageText(e.target.value)
                handleTyping()
              }}
              placeholder="Digite sua mensagem..."
              className="flex-1 rounded-full border-border bg-muted/40 px-4 focus-visible:ring-primary/30"
              disabled={isPending}
              autoComplete="off"
            />
            <Button
              type="submit"
              size="icon"
              className="shrink-0 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={!messageText.trim() || isPending}
            >
              <Send className="h-4 w-4" />
              <span className="sr-only">Enviar</span>
            </Button>
          </form>
        </div>
      )}

      {isClosed && (
        <div className="border-t bg-muted/30 px-4 py-3">
          <p className="text-center text-sm text-muted-foreground">
            Esta negociação está {negotiationStatus === "FECHADA" ? "fechada" : "cancelada"}. Não é possível enviar novas mensagens.
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Proposal Card ──────────────────────────────────────────────────────────────

function ProposalCard({
  proposal,
  isOwn,
  currentUserId,
  onRespond,
  isPending,
}: {
  proposal: ProposalType
  isOwn: boolean
  currentUserId: string
  onRespond: (proposalId: string, action: "ACEITA" | "RECUSADA" | "CONTRA_PROPOSTA") => void
  isPending: boolean
}) {
  const statusConfig = getProposalStatusConfig(proposal.status)
  const canRespond = proposal.senderId !== currentUserId && proposal.status === "PENDENTE"
  const headerText = isOwn ? "Proposta Enviada" : "Proposta Recebida"

  return (
    <Card className={`overflow-hidden border-2 shadow-md ${
      proposal.status === "ACEITA" ? "border-green-300 bg-green-50/50"
        : proposal.status === "RECUSADA" ? "border-red-200 bg-red-50/30"
        : isOwn ? "border-primary/30 bg-primary/5"
        : "border-blue-300 bg-blue-50/50"
    }`}>
      <div className={`px-3.5 py-2 ${
        proposal.status === "ACEITA" ? "bg-green-100"
          : proposal.status === "RECUSADA" ? "bg-red-100"
          : isOwn ? "bg-primary/10"
          : "bg-blue-100"
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HandshakeIcon className={`h-4 w-4 ${
              proposal.status === "ACEITA" ? "text-green-700"
                : proposal.status === "RECUSADA" ? "text-red-700"
                : isOwn ? "text-primary"
                : "text-blue-700"
            }`} />
            <span className="text-xs font-semibold uppercase tracking-wide">{headerText}</span>
          </div>
          <Badge className={`text-[10px] ${statusConfig.className}`}>{statusConfig.label}</Badge>
        </div>
      </div>

      <CardContent className="space-y-2 p-3.5 text-sm">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
          <div>
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Produto</span>
            <p className="font-medium text-foreground">{proposal.product}</p>
          </div>
          <div>
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Quantidade</span>
            <p className="font-medium text-foreground">{proposal.quantity} {proposal.unit === "tonelada" ? "ton" : "sc"}</p>
          </div>
          <div>
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Preço</span>
            <p className="font-semibold text-primary">R$ {formatCurrency(proposal.price)}/{proposal.unit === "tonelada" ? "ton" : "sc"}</p>
          </div>
          <div>
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Local</span>
            <p className="font-medium text-foreground">{proposal.city} - {proposal.state}</p>
          </div>
          <div>
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Pagamento</span>
            <p className="font-medium text-foreground">{getPaymentLabel(proposal.paymentTerms)}</p>
          </div>
          <div>
            <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Entrega</span>
            <p className="font-medium text-foreground">
              {proposal.deliveryType}
              {proposal.deliveryDate && <span className="text-muted-foreground"> &middot; {proposal.deliveryDate}</span>}
            </p>
          </div>
        </div>

        {proposal.observation && (
          <>
            <Separator />
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Observação</span>
              <p className="mt-0.5 text-sm text-foreground/80">{proposal.observation}</p>
            </div>
          </>
        )}

        <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
          <span>{proposal.sender.name}</span>
          <span>{formatDate(proposal.createdAt)} {formatTime(proposal.createdAt)}</span>
        </div>

        {canRespond && (
          <>
            <Separator />
            <div className="flex items-center gap-2 pt-1">
              <Button size="sm" className="flex-1 gap-1.5 bg-green-600 text-white hover:bg-green-700" onClick={() => onRespond(proposal.id, "ACEITA")} disabled={isPending}>
                <Check className="h-3.5 w-3.5" />
                Aceitar
              </Button>
              <Button size="sm" variant="outline" className="flex-1 gap-1.5 border-amber-300 text-amber-700 hover:bg-amber-50" onClick={() => onRespond(proposal.id, "CONTRA_PROPOSTA")} disabled={isPending}>
                <RotateCcw className="h-3.5 w-3.5" />
                Contraproposta
              </Button>
              <Button size="sm" variant="outline" className="flex-1 gap-1.5 border-red-300 text-red-700 hover:bg-red-50" onClick={() => onRespond(proposal.id, "RECUSADA")} disabled={isPending}>
                <X className="h-3.5 w-3.5" />
                Recusar
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Proposal Form ──────────────────────────────────────────────────────────────

function ProposalForm({
  offer,
  onSubmit,
  isPending,
}: {
  offer: Props["negotiation"]["offer"]
  onSubmit: (formData: FormData) => void
  isPending: boolean
}) {
  const [product, setProduct] = useState(offer.product)
  const [quantity, setQuantity] = useState(String(offer.quantity))
  const [unit, setUnit] = useState(offer.unit)
  const [price, setPrice] = useState(offer.price ? String(offer.price) : "")
  const [city, setCity] = useState(offer.city)
  const [state, setState] = useState(offer.state)
  const [deliveryType, setDeliveryType] = useState(offer.deliveryType)
  const [deliveryDate, setDeliveryDate] = useState("")
  const [paymentTerms, setPaymentTerms] = useState("a_vista")
  const [observation, setObservation] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const formData = new FormData()
    formData.set("product", product)
    formData.set("quantity", quantity)
    formData.set("unit", unit)
    formData.set("price", price)
    formData.set("city", city)
    formData.set("state", state)
    formData.set("deliveryType", deliveryType)
    formData.set("deliveryDate", deliveryDate)
    formData.set("paymentTerms", paymentTerms)
    formData.set("observation", observation)
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div className="space-y-1.5">
        <Label htmlFor="proposal-product">Produto</Label>
        <Select value={product} onValueChange={setProduct}>
          <SelectTrigger id="proposal-product"><SelectValue /></SelectTrigger>
          <SelectContent>
            {PRODUCTS.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="proposal-quantity">Quantidade</Label>
          <Input id="proposal-quantity" type="number" step="any" min="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="proposal-unit">Unidade</Label>
          <Select value={unit} onValueChange={setUnit}>
            <SelectTrigger id="proposal-unit"><SelectValue /></SelectTrigger>
            <SelectContent>
              {UNITS.map((u) => (<SelectItem key={u} value={u}>{u}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="proposal-price">Preço por unidade (R$) *</Label>
        <Input id="proposal-price" type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Ex: 135.00" required />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="proposal-city">Cidade</Label>
          <Input id="proposal-city" value={city} onChange={(e) => setCity(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="proposal-state">Estado</Label>
          <Input id="proposal-state" value={state} onChange={(e) => setState(e.target.value)} maxLength={2} required />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="proposal-delivery-type">Tipo de Entrega</Label>
        <Select value={deliveryType} onValueChange={setDeliveryType}>
          <SelectTrigger id="proposal-delivery-type"><SelectValue /></SelectTrigger>
          <SelectContent>
            {DELIVERY_TYPES.map((dt) => (<SelectItem key={dt} value={dt}>{dt}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="proposal-delivery-date">Data de Entrega</Label>
        <Input id="proposal-delivery-date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} placeholder="Ex: até 15/03" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="proposal-payment">Condições de Pagamento</Label>
        <Select value={paymentTerms} onValueChange={setPaymentTerms}>
          <SelectTrigger id="proposal-payment"><SelectValue /></SelectTrigger>
          <SelectContent>
            {PAYMENT_TERMS.map((pt) => (<SelectItem key={pt.value} value={pt.value}>{pt.label}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="proposal-observation">Observação</Label>
        <Textarea id="proposal-observation" value={observation} onChange={(e) => setObservation(e.target.value)} placeholder="Observações adicionais..." rows={3} />
      </div>

      <Button type="submit" className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90" disabled={isPending || !price}>
        <Send className="h-4 w-4" />
        {isPending ? "Enviando..." : "Enviar Proposta"}
      </Button>
    </form>
  )
}
