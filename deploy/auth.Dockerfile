FROM public.ecr.aws/supabase/gotrue:v2.195.0
USER root
RUN apk add --no-cache postgresql-client
COPY --chmod=755 deploy/start-auth.sh /usr/local/bin/start-auth.sh
USER supabase
ENTRYPOINT ["/usr/local/bin/start-auth.sh"]
