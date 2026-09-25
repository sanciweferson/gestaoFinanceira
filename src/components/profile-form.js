"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "../lib/supabase/client"

const MAX_AVATAR_BYTES = 2 * 1024 * 1024
const AVATAR_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}

export default function ProfileForm({ user }) {
  const router = useRouter()
  const fileInput = useRef(null)
  const [fullName, setFullName] = useState(user.fullName)
  const [avatarUrl, setAvatarUrl] = useState("")
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false
    if (!user.avatarPath) {
      return () => {
        cancelled = true
      }
    }

    createClient()
      .storage.from("avatars")
      .createSignedUrl(user.avatarPath, 3600)
      .then(({ data, error: signedUrlError }) => {
        if (cancelled) return
        if (signedUrlError)
          setError(
            "Não foi possível carregar a foto. Confira a configuração do armazenamento.",
          )
        else setAvatarUrl(data?.signedUrl || "")
      })
    return () => {
      cancelled = true
    }
  }, [user.avatarPath])

  async function saveName(event) {
    event.preventDefault()
    setBusy(true)
    setMessage("")
    setError("")
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({
      data: { ...user.metadata, full_name: fullName.trim() },
    })
    setBusy(false)
    if (updateError) {
      setError(updateError.message)
      return
    }
    router.replace("/")
  }

  async function uploadAvatar(event) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    setError("")
    setMessage("")
    if (!AVATAR_TYPES[file.type]) {
      setError("Escolha uma imagem JPG, PNG ou WebP.")
      return
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setError("A imagem precisa ter até 2 MB.")
      return
    }

    setBusy(true)
    const supabase = createClient()
    const oldPath = user.avatarPath
    const newPath = `${user.id}/${crypto.randomUUID()}.${AVATAR_TYPES[file.type]}`
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(newPath, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      setBusy(false)
      setError(uploadError.message || "Não foi possível enviar a imagem.")
      return
    }

    const { error: metadataError } = await supabase.auth.updateUser({
      data: {
        ...user.metadata,
        full_name: fullName.trim(),
        avatar_path: newPath,
      },
    })
    if (metadataError) {
      await supabase.storage.from("avatars").remove([newPath])
      setBusy(false)
      setError(
        metadataError.message || "Não foi possível salvar a foto no perfil.",
      )
      return
    }

    if (oldPath) await supabase.storage.from("avatars").remove([oldPath])
    const { data } = await supabase.storage
      .from("avatars")
      .createSignedUrl(newPath, 3600)
    setAvatarUrl(data?.signedUrl || "")
    setBusy(false)
    setMessage("Foto do perfil atualizada.")
    router.refresh()
  }

  async function removeAvatar() {
    if (!user.avatarPath) return
    setBusy(true)
    setMessage("")
    setError("")
    const supabase = createClient()
    const { error: metadataError } = await supabase.auth.updateUser({
      data: { ...user.metadata, full_name: fullName.trim(), avatar_path: null },
    })
    if (metadataError) {
      setBusy(false)
      setError(
        metadataError.message || "Não foi possível remover a foto do perfil.",
      )
      return
    }

    const { error: removeError } = await supabase.storage
      .from("avatars")
      .remove([user.avatarPath])
    setAvatarUrl("")
    setBusy(false)
    setMessage(
      removeError
        ? "Foto removida do perfil. Um arquivo antigo não pôde ser limpo do armazenamento."
        : "Foto removida do perfil.",
    )
    router.refresh()
  }

  return (
    <main className="auth-page profile-page">
      <section className="auth-card profile-card">
        <Link className="brand auth-brand" href="/">
          <span className="brand-mark">M</span>
          <span>
            meu<span className="brand-light">financeiro</span>
          </span>
        </Link>
        <p className="eyebrow">SUA CONTA</p>
        <h1>Meu perfil</h1>
        <p className="auth-description">
          Personalize como seu nome e sua foto aparecem no sistema.
        </p>

        <div className="profile-photo-section">
          <span
            className={`profile-avatar profile-avatar-large${avatarUrl ? " has-photo" : ""}`}
            style={
              avatarUrl ? { backgroundImage: `url("${avatarUrl}")` } : undefined
            }
            aria-label={
              avatarUrl ? `Foto de ${fullName || user.email}` : undefined
            }
            role={avatarUrl ? "img" : undefined}
          >
            {avatarUrl
              ? ""
              : (fullName || user.email || "U").slice(0, 1).toUpperCase()}
          </span>
          <div>
            <strong>Foto do perfil</strong>
            <p>JPG, PNG ou WebP. Até 2 MB.</p>
            <div className="profile-photo-actions">
              <button
                className="button button-secondary"
                type="button"
                onClick={() => fileInput.current?.click()}
                disabled={busy}
              >
                {avatarUrl ? "Trocar foto" : "Adicionar foto"}
              </button>
              {avatarUrl && (
                <button
                  className="text-button-danger"
                  type="button"
                  onClick={removeAvatar}
                  disabled={busy}
                >
                  Remover foto
                </button>
              )}
            </div>
          </div>
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={uploadAvatar}
            hidden
          />
        </div>

        <form onSubmit={saveName} className="auth-form profile-name-form">
          <label className="form-field">
            Nome
            <input
              type="text"
              autoComplete="name"
              maxLength={80}
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Seu nome"
              required
            />
          </label>
          <label className="form-field">
            E-mail
            <input type="email" value={user.email} disabled />
          </label>
          {error && (
            <p className="auth-message auth-error" role="alert">
              {error}
            </p>
          )}
          {message && (
            <p className="auth-message auth-success" role="status">
              {message}
            </p>
          )}
          <button
            className="button button-primary auth-submit"
            type="submit"
            disabled={busy}
          >
            {busy ? "Salvando..." : "Salvar nome"}
          </button>
        </form>

        <p className="auth-security">
          Suas fotos ficam em armazenamento privado e são acessíveis apenas pela
          sua conta.
        </p>
      </section>
    </main>
  )
}
