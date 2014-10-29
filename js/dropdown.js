/**
 * Pragma.Libs.Dropdown
 * Plugin para creación de menús desplegables.
 * Creado por Stefan Luy 2014.
 * Publicado bajo la licencia MIT http://pragmaui.com/docs/primeros-pasos/licencia
 * #---------------
 * Html:
 * #---------------
 * data-pragma-dropdown : define el menú desplegable
 *                                           
 * data-pragma-dropdown-toggle="elemento" :   Abre o cierra el menú desplegable dependiendo de estado actual. Al no
 *                                            especificarse el elemento objetivo, tomará el próximo elemento con el
 *                                            atributo [data-pragma-dropdown].
 *                                          
 * data-pragma-dropdown-hover="elemento"  :   Abre y cierra el menú desplegable con los eventos mouseleave y mouseenter. 
 *                                            Al no especificarse el elemento objetivo, tomará el próximo elemento con 
 *                                            el atributo [data-pragma-dropdown].
 *
 * data-dropdown-options="[opciones]"     :   opciones de configuración del menú desplegable.
 * #-----------------
 * Métodos:
 * #-----------------
 * Dropdown.open($trigger)   : abre el menú desplegable.
 * Dropdown.close()          : cierra el menú desplegable.
 * Dropdown.toggle($trigger) : abre o cierra el menú desplegable dependiendo del estado actual.
 * Dropdown.close_all()      : cierra todos los menús desplegables abiertos en la página.
 * #-----------------
 * Eventos:
 * #-----------------
 * pragma.dropdown.before_init : lanzado al inicializar el plugin dropdown.
 * pragma.dropdown.after_init  : lanzado al terminar la configuración inicial del plugin dropdown.
 * 
 * pragma.dropdown.opening : Evento disparado inmediatamente después de llamarse el metodo [open()]. El control que
 *                           activó el menú desplegable estará disponible en la propiedad [trigger] del evento.
 *
 * pragma.dropdown.open    : Evento disparado cuando el menú ya es visible para el usuario al terminar de ejecutarse
 *                           el método [open()] y las animaciones del mismo. El control que activó el menú desplegable 
 *                           estará disponible en la propiedad [trigger] del evento.
 *                           
 * pragma.dropdown.closing : Evento disparado inmediatamente luego de llamarse el metodo [close()]. El control que
 *                           activó el menú desplegable estará disponible en la propiedad [trigger] del evento.
 *
 * pragma.dropdown.closed  : Evento disparado cuando el menú ya no es visible para el usuario al terminar de ejecutarse
 *                           el método [close()] y las animaciones del mismo. El control que activó el menú desplegable 
 *                           estará disponible en la propiedad [trigger] del evento.
 * #-----------------
 * Dependencias:
 * #-----------------
 * js/pragma.js
 * less/dropdown.less
 * less/mixins/dropdown.less
 */

$(function (Pragma, $, undefined)
{
	"use strict";
	Pragma.Libs.Dropdown = function (element, options)
	{
		var self = this;
		self.$el = element;
		self.options = options;
		/**
		* Método privado.
		* Configura los efectos visuales por defecto.
		*/
		function configure_fx()
		{
			self.fx = new Pragma.Utils.fx_manager();
			//Agrega el efecto "fade"
			self.fx.add("fade", function (action, callback)
			{
				var speed = Pragma.Utils.get_instance_option(self, "fx_speed", action);
				var easing = Pragma.Utils.get_instance_option(self, "fx_easing", action)
				if (action == "open")
				{
					self.$el.finish().fadeIn(speed, easing, function () { callback(); });
				} else
				{
					self.$el.finish().fadeOut(speed, easing, function () { callback(); });
				}
			});
		}
		/**
		* Método privado.
		* Configura el plugin al ser inicializado.
		*/
		function configure()
		{
			self.$el.trigger("pragma.dropdown.before_init");
			self.$trigger = false;
			configure_fx();
			self.$el.trigger("pragma.dropdown.after_init");

			//Cierra el menú desplegable al hacer click en cualquier lado de la página
			$("html").click(function (e) { self.close(); });
			//Si el elemento NO es una lista desordenada o debe prevenirse se cierre al hacer click
			if (!self.$el.is("ul") || self.options.prevent_close)
			{
				self.$el.click(function (e)
				{
					//Pprevenimos lo cierre
					e.stopPropagation();
				});
			}
		}
		/**
		* Método privado.
		* Recalcula la posición del menú desplegable.
		*/
		function repos($trigger)
		{
			//Al no definirse el elemento que activa el menú desplegable, detiene la ejecución del método.
			if (typeof ($trigger) != "object" || $trigger.length == 0)
			{
				return false;
			}
			//Si el ancho del menú desplegable debe ser igual al del elemento que lo activa:
			if (self.$el.hasClass("inherit"))
			{
				self.$el.css("width", $trigger.outerWidth());
			}
			//Variable que almacenará la posición final del menú desplegable.
			var pos =
			{
				top: 0,
				left: 0
			};
			//Alto y ancho del menú desplegable
			var dropdown =
			{
				height: self.$el.outerHeight(),
				width: self.$el.outerWidth()
			}
			//Alto/Ancho y Posición de la ventana
			var win =
			{
				height: $(window).height(),
				width: $(window).width(),
				top: $(window).scrollTop(),
				bottom: $(window).scrollTop() + $(window).height()
			};
			//Posiciones del elemento que activó el menú desplegable.
			var trigger =
			{
				top: $trigger.position().top,
				bottom: $trigger.position().top + $trigger.outerHeight(),
				left: $trigger.position().left,
				right: $trigger.position().left + $trigger.outerWidth(),
				oTop: $trigger.offset().top,
				oBottom: $trigger.offset().top + $trigger.outerHeight(),
				oLeft: $trigger.offset().left,
				oRight: $trigger.offset().left + $trigger.outerWidth(),
				width: $trigger.outerWidth()
			};
			//Si el menú no está abierto, lo despliega como un bloque invisible para tomar
			//sus dimensiones reales, y luego, restituye su estado.
			if (!self.$el.hasClass('open'))
			{
				self.$el.css({ display: "block", visibility: "hidden" });
				dropdown.height = self.$el.outerHeight();
				dropdown.width = self.$el.outerWidth();
				self.$el.css({ display: "none", visibility: "visible" });
			}

			var $caret = $trigger.find(".caret");
			if ($caret.length == 0)
			{
				$caret = $trigger.append('<span class="caret"></span>');
			}

			//Si no hay espacio para desplegarse hacia abajo pero si hacia arriba ó
			//es dropup y hay espacio hacia arriba, mostrará arriba el menú, de lo
			//contrario,abajo
			if ((trigger.oBottom + dropdown.height > win.bottom && trigger.oTop - dropdown.height >= win.top) ||
					(self.options.dropup && (trigger.oTop - dropdown.height >= win.top)))
			{
				pos.top = trigger.top - dropdown.height;
			} else
			{
				pos.top = trigger.bottom;
			}
			//Si no hay espacio a la derecha pero si hacia la derecha ó
			//está seteado para alinearse de derecha a izquierda y hay espacio
			//lo desplegará de derecha a izquierda, de lo contrario, de izquierda a derecha
			if ((trigger.oLeft + dropdown.width > win.width && trigger.oRight - dropdown.width >= 0)
				|| (self.options.right_to_left && trigger.oRight - dropdown.width >= 0))
			{
				pos.left = trigger.right - dropdown.width;
			} else
			{
				pos.left = trigger.left;
			}


			self.$el.css({ top: pos.top, left: pos.left });
		}

		/**
		* Cierra todos los menús desplegables abiertos.
		*/
		self.close_all = function ()
		{
			$("[data-pragma-dropdown]").each(function () { $(this).pragma("dropdown", "close") });
		}
		/**
		* Abre el menú desplegable.
		*/
		self.open = function ($trigger)
		{
			//Detiene la ejecución del script si el menú desplegable ya está abierto.
			if (self.$el.hasClass('open'))
			{
				return;
			}

			//En caso que no se definiera el elemento que activa el menú desplegable, 
			//tomará el último usado.
			if (typeof ($trigger) != "object" || $trigger.length == 0)
			{
				$trigger = self.$trigger;
			}
			//Almacena el elemento que activó el menú desplegable.
			self.$trigger = $trigger;
			//Dispara el evento pragma.dropdown.opening pasando como parámetro 'trigger' el elemento
			//que activó el menú desplegable.
			self.$el.trigger({
				type: "pragma.dropdown.opening",
				trigger: $trigger
			});
			//Cierra todos los menús abiertos
			self.close_all();
			//Si el elemento que activó el menú desplegable está dentro de una lista, agregará a la misma la clase
			//'active'. De lo contrario, agregará dicha clase directamente al elemento que activó el menú desplegable.
			if ($trigger.parent().is("li"))
			{
				if($trigger.parent().data("Pragma.Libs.Dropdown.PreserveActive") === undefined)
				{
					if($trigger.parent().hasClass("active"))
					{
						$trigger.parent().data("Pragma.Libs.Dropdown.PreserveActive",true);
					}
					else
					{
						$trigger.parent().data("Pragma.Libs.Dropdown.PreserveActive",false);
					}
				}
				$trigger.parent().addClass("active");
			} else
			{
				if($trigger.data("Pragma.Libs.Dropdown.PreserveActive") === undefined)
				{
					if($trigger.hasClass("active"))
					{
						$trigger.data("Pragma.Libs.Dropdown.PreserveActive",true);
					}
					else
					{
						$trigger.data("Pragma.Libs.Dropdown.PreserveActive",false);
					}
				}
				$trigger.addClass("active");
			}

			self.$el.addClass("open").css("display", "none");
			//Reposiciona el menú desplegable con respecto al elemento que lo activó.
			repos($trigger);
			//Inicia la animación
			self.fx.run(Pragma.Utils.get_instance_option(self, "fx", "open"), "open", function ()
			{
				//Al terminar la animación:
				//Agrega la clase "open" y convierte el menú desplegable en bloque.
				self.$el.css({ display: "block" });
				//Dispara el evento pragma.dropdown.open pasando como parámetro 'trigger' el elemento
				//que activó el menú desplegable.
				self.$el.trigger({
					type: "pragma.dropdown.open",
					trigger: $trigger
				});
			});
		}
		/**
		* Cierra el menú desplegable.
		*/
		self.close = function ($trigger)
		{
			//Detiene la ejecución del script si el menú desplegable no está abierto.
			if (!self.$el.hasClass('open'))
			{
				return;
			}
			//En caso que no se definiera el elemento que cierra el menú desplegable, 
			//tomará el último usado.
			if (typeof ($trigger) != "object" || $trigger.length == 0)
			{
				$trigger = self.$trigger;
			}
			//Dispara el evento pragma.dropdown.closing pasando como parámetro 'trigger' el elemento
			//que cerró el menú desplegable.
			self.$el.trigger({
				type: "pragma.dropdown.closing",
				trigger: $trigger
			});
			//Inicia la animación
			self.fx.run(Pragma.Utils.get_instance_option(self, "fx", "close"), "close", function ()
			{
				//Al terminar la animación:
				//Si el elemento que cerró el menú desplegable está dentro de una lista, removerá de ella la clase
				//'active'. De lo contrario, removerá dicha clase directamente del elemento que cerró el menú desplegable.
				if (self.$trigger.parent().is("li"))
				{
					if(!self.$trigger.parent().data("Pragma.Libs.Dropdown.PreserveActive"))
					{
						self.$trigger.parent().removeClass("active");
					}
					
				} else
				{
					if(!self.$trigger.data("Pragma.Libs.Dropdown.PreserveActive"))
					{
						self.$trigger.removeClass("active");
					}
				}
				//Remueve la clase "open" y esconde el menú desplegable.
				self.$el.removeClass("open").css({ display: "none" });
				//Dispara el evento pragma.dropdown.closed pasando como parámetro 'trigger' el elemento
				//que cerró el menú desplegable.
				self.$el.trigger({
					type: "pragma.dropdown.closed",
					trigger: $trigger
				});
			});
		}
		/**
		* Abre o cierra el menú desplegable dependiendo de su estado actual.
		*/
		self.toggle = function ($trigger)
		{
			if (self.$el.hasClass("open"))
			{
				self.close($trigger);
			} else
			{
				self.open($trigger);
			}
		}
		//Inicia la configuración inicial del plugin.
		configure();
	}
	//Versión del plugin
	Pragma.Libs.Dropdown.Ver = "1.0.0";
	//Configuración
	Pragma.Libs.Dropdown.Defaults = {
		fx: "fade",  //Tipo de efecto del menú desplegable al abrir/cerrar. [none|fade]
		open_fx: "inherit",
		close_fx: "inherit",
		fx_speed: 200,
		open_fx_speed: "inherit",
		close_fx_speed: "inherit",
		fx_easing: false,
		open_fx_easing: "inherit",
		close_fx_easing: "inherit",
		dropup: false,   //Determina si el menú desplegable abrirá por defecto hacia arriba.[true|false]
		right_to_left: false,   //Determina si el menú se mostrará de izquierda<-derecha.[true|false]
		prevent_close: false
	}



	$(document).on('click.pragma.dropdown.toggle', '[data-dropdown-toggle]', function (e)
	{
		e.preventDefault();
		var $target = Pragma.Utils.get_target($(this), "dropdown-toggle", "[data-pragma-dropdown]");
		if ($target)
		{
			$target.pragma("dropdown", "toggle", $(this));
		}
	});
	$(document).on('mouseenter.pragma.dropdown.open', '[data-dropdown-hover]', function (e)
	{
		var $target = Pragma.Utils.get_target($(this), "dropdown-hover", "[data-pragma-dropdown]", false, "[data-pragma-dropdown]");
		if ($target)
		{
			$target.pragma("dropdown", "open", $(this));
		}
	});

	$(document).on('mouseleave.pragma.dropdown.close', '[data-dropdown-hover]', function (e)
	{
		var $target = Pragma.Utils.get_target($(this), "dropdown-hover", "[data-pragma-dropdown]", false, "[data-pragma-dropdown]");
		if ($target)
		{
			$target.pragma("dropdown", "close", $(this));
		}
	});


} (window.Pragma = window.Pragma || {}, jQuery));